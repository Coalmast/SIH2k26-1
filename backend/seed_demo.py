import os, sys, uuid, json
import datetime

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("psycopg2-binary not installed.\nRun: pip install psycopg2-binary")
    sys.exit(1)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

_raw = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@127.0.0.1:54322/postgres")
DB_URL = _raw.replace("postgresql+asyncpg://", "postgresql://").replace("asyncpg://", "postgresql://")

def uid():
    return str(uuid.uuid4())

# Stable IDs for demo
ORG_ID = "00000000-0000-0000-0000-000000000001"
SUB_ID = "00000000-0000-0000-0000-000000000002"
MINE_ID = "00000000-0000-0000-0000-000000000004"
ADMIN_USER_ID = "6b339687-5103-4463-9eae-e6bceba9eb1f"
MANAGER_USER_ID = "00000000-0000-0000-0000-000000000010"
OFFICER_USER_ID = "00000000-0000-0000-0000-000000000011"
SAFETY_MANAGER_USER_ID = "00000000-0000-0000-0000-000000000012"
TEMPLATE_GAS_ID = "00000000-0000-0000-0000-000000000020"
TEMPLATE_DGMS_ID = "00000000-0000-0000-0000-000000000021"
SAFETY_INSTANCE_ID = "00000000-0000-0000-0000-000000000030"

def seed_demo():
    print("Connecting to DB...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        # Truncate tables for clean state
        print("Truncating tables...")
        cur.execute("""
            TRUNCATE TABLE 
            compliance_instances, compliance_requirements, regulations,
            observations, inspections, inspection_checklist_templates,
            user_roles, users, mines, subsidiaries, organizations
            CASCADE;
        """)

        print("Seeding Organizations, Subsidiaries, Mines...")
        cur.execute(
            "INSERT INTO organizations (id, name, type) VALUES (%s, %s, %s)",
            (ORG_ID, "Coal India Limited", "psu")
        )
        cur.execute(
            "INSERT INTO subsidiaries (id, organization_id, name, code, state) VALUES (%s, %s, %s, %s, %s)",
            (SUB_ID, ORG_ID, "WCL — Western Coalfields Ltd.", "WCL", "Maharashtra")
        )
        cur.execute(
            "INSERT INTO mines (id, subsidiary_id, name, mine_type, status, district, state) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (MINE_ID, SUB_ID, "Umrer OCP", "opencast", "active", "Nagpur", "Maharashtra")
        )

        print("Seeding Users and Roles...")
        cur.execute("SELECT id, name FROM roles")
        roles_db = {r["name"]: str(r["id"]) for r in cur.fetchall()}
        if not roles_db:
            # Insert basic roles if missing
            cur.execute("INSERT INTO roles (id, name, scope_level) VALUES (%s, 'system_admin', 'organization') RETURNING id", (uid(),))
            roles_db['system_admin'] = cur.fetchone()['id']
            cur.execute("INSERT INTO roles (id, name, scope_level) VALUES (%s, 'mine_manager', 'mine') RETURNING id", (uid(),))
            roles_db['mine_manager'] = cur.fetchone()['id']
            cur.execute("INSERT INTO roles (id, name, scope_level) VALUES (%s, 'field_officer', 'mine') RETURNING id", (uid(),))
            roles_db['field_officer'] = cur.fetchone()['id']

        users = [
            (ADMIN_USER_ID, "Admin User", "krunal6214@gmail.com", MINE_ID, SUB_ID, "System Admin", "system_admin"),
            (MANAGER_USER_ID, "Rajesh Kumar", "rajesh.k@umrer.wcl.in", MINE_ID, SUB_ID, "Mine Manager", "mine_manager"),
            (OFFICER_USER_ID, "Sunil Patil", "sunil.p@umrer.wcl.in", MINE_ID, SUB_ID, "Field Officer", "field_officer"),
            (SAFETY_MANAGER_USER_ID, "Priya Sharma", "priya.s@umrer.wcl.in", MINE_ID, SUB_ID, "Safety Manager", "mine_manager"),
        ]

        for u in users:
            cur.execute(
                "INSERT INTO users (id, full_name, email, mine_id, subsidiary_id, designation, is_active) VALUES (%s, %s, %s, %s, %s, %s, true)",
                (u[0], u[1], u[2], u[3], u[4], u[5])
            )
            if u[6] in roles_db:
                cur.execute(
                    "INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s)",
                    (u[0], roles_db[u[6]])
                )

        print("Seeding Regulations...")
        regs = [
            ("CMR-2017-REG5", "Gas Sampling & Air Quality in Mines", "Coal Mines Regulations 2017", "safety", "dgms"),
            ("CMR-2017-REG68", "Ventilation in Coal Mines", "Coal Mines Regulations 2017", "safety", "dgms"),
            ("CMR-2017-REG106", "Dust Suppression & Sampling", "Coal Mines Regulations 2017", "environment", "dgms"),
            ("EPA-1986-SCH6", "Environmental Standards for Mining", "Environment Protection Act 1986", "environment", "moefcc"),
            ("CMR-2017-REG100", "Support in Mines (Strata Control)", "Coal Mines Regulations 2017", "safety", "dgms"),
        ]
        reg_ids = {}
        for r in regs:
            reg_id = uid()
            reg_ids[r[0]] = reg_id
            cur.execute(
                "INSERT INTO regulations (id, code, title, statute, category, authority) VALUES (%s, %s, %s, %s, %s, %s)",
                (reg_id, r[0], r[1], r[2], r[3], r[4])
            )

        print("Seeding Checklist Templates...")
        env_items = [
            {"id": "GAS-O2", "text": "Oxygen (O₂) level at working face", "regulation": "CMR 2017, Reg. 5(1)(a)", "unit": "%", "normal_range": ">= 19.5", "danger_threshold": "< 19.5", "measurement_required": True, "notes": "Minimum 19.5% O₂ must be maintained"},
            {"id": "GAS-CO2", "text": "Carbon Dioxide (CO₂) concentration", "regulation": "CMR 2017, Reg. 5(1)(c)", "unit": "%", "normal_range": "<= 0.5", "danger_threshold": "> 0.5", "measurement_required": True, "notes": "CO₂ must not exceed 0.5%"},
            {"id": "GAS-CO", "text": "Carbon Monoxide (CO) levels", "regulation": "CMR 2017, Reg. 5(1)(b)", "unit": "ppm", "normal_range": "<= 50", "danger_threshold": "> 50", "measurement_required": True, "notes": "Max permissible limit: 50 ppm"},
            {"id": "GAS-CH4", "text": "Methane (CH₄) / Firedamp concentration", "regulation": "CMR 2017, Reg. 5(2) & Reg. 68", "unit": "%", "normal_range": "< 0.25", "danger_threshold": "> 1.25", "warning_threshold": "> 0.25", "measurement_required": True, "notes": "All electric equipment must be cut off at 1.25%"},
            {"id": "GAS-H2S", "text": "Hydrogen Sulphide (H₂S) concentration", "regulation": "CMR 2017, Reg. 5(1)(d)", "unit": "ppm", "normal_range": "<= 10", "danger_threshold": "> 10", "measurement_required": True, "notes": "H₂S must not exceed 10 ppm"},
            {"id": "GAS-NO2", "text": "Nitrogen Dioxide (NO₂) — post-blasting", "regulation": "CMR 2017, Reg. 5(1)(e)", "unit": "ppm", "normal_range": "<= 5", "danger_threshold": "> 5", "measurement_required": True, "notes": "Generated during blasting"},
            {"id": "GAS-SO2", "text": "Sulphur Dioxide (SO₂) levels", "regulation": "CMR 2017, Reg. 5(1)(f)", "unit": "ppm", "normal_range": "<= 2", "danger_threshold": "> 2", "measurement_required": True, "notes": "SO₂ must not exceed 2 ppm"},
            {"id": "DUST-PM10", "text": "Respirable coal dust (PM10) — RSPM", "regulation": "CMR 2017, Reg. 106", "unit": "mg/m³", "normal_range": "<= 3", "danger_threshold": "> 3", "measurement_required": True, "notes": "Respirable suspended particulate matter"},
            {"id": "VENT-FLOW", "text": "Ventilation air quantity at working face", "regulation": "CMR 2017, Reg. 68(1)", "unit": "m³/min", "normal_range": ">= 30", "danger_threshold": "< 30", "measurement_required": True, "notes": "Minimum 30 m³/min per person"},
            {"id": "VENT-VEL", "text": "Air velocity in intake/return airways", "regulation": "CMR 2017, Reg. 68(2)", "unit": "m/min", "normal_range": "60 - 300", "danger_threshold": "< 30", "measurement_required": True, "notes": "Min 30 m/min in airways"},
            {"id": "TEMP-WB", "text": "Wet Bulb Temperature at working face", "regulation": "CMR 2017, Reg. 5(2)", "unit": "°C", "normal_range": "<= 33.5", "danger_threshold": "> 33.5", "measurement_required": True, "notes": "Max wet bulb temp: 33.5°C"},
            {"id": "DETECTOR-CALIB", "text": "Multi-gas detector calibration certificate valid", "regulation": "CMR 2017, Reg. 5(3)", "unit": "status", "normal_range": "Valid", "danger_threshold": "Expired", "measurement_required": False, "notes": "Frequency: quarterly"},
            {"id": "NOISE-DB", "text": "Ambient noise level in working area", "regulation": "Mines Act 1952, Sec 20", "unit": "dB(A)", "normal_range": "<= 90", "danger_threshold": "> 90", "measurement_required": True, "notes": "8-hour TWA must not exceed 90 dB(A)"},
            {"id": "WATER-PH", "text": "Mine drainage water pH level", "regulation": "Environment Protection Act 1986, Schedule VI", "unit": "pH", "normal_range": "6.0 - 8.5", "danger_threshold": "< 5.5", "measurement_required": True, "notes": "Mine water discharge SPCB conditions"},
            {"id": "VIS-LOG", "text": "Ventilation officer's daily register maintained", "regulation": "CMR 2017, Reg. 68(6)", "unit": "status", "normal_range": "Updated", "danger_threshold": "Missing", "measurement_required": False, "notes": "Must be maintained by competent person"}
        ]
        
        cur.execute(
            "INSERT INTO inspection_checklist_templates (id, name, inspection_type, applicable_mine_types, regulation_reference, checklist_items) VALUES (%s, %s, %s::inspection_type_enum, %s::mine_type_enum[], %s, %s)",
            (TEMPLATE_GAS_ID, "Environmental Gas & Air Quality", "environmental_pcb", ["opencast", "underground"], "CMR 2017, Regulations 5 & 68; EP Act 1986", json.dumps(env_items))
        )
        
        dgms_items = [
            {"id": "ROOF-SUPPORT", "text": "Roof support as per systematic support plan", "regulation": "CMR 2017, Reg. 100", "measurement_required": False},
            {"id": "FIRE-EXT", "text": "Fire extinguishers operational", "regulation": "CMR 2017, Reg. 138", "measurement_required": False},
        ]
        cur.execute(
            "INSERT INTO inspection_checklist_templates (id, name, inspection_type, applicable_mine_types, regulation_reference, checklist_items) VALUES (%s, %s, %s::inspection_type_enum, %s::mine_type_enum[], %s, %s)",
            (TEMPLATE_DGMS_ID, "DGMS Annual General Safety", "dgms_annual_general", ["opencast"], "CMR 2017, Regulations 100, 105, 138, 141", json.dumps(dgms_items))
        )

        print("Seeding Compliance Requirements and Instances...")
        reqs = [
            ("Monthly Environmental Monitoring Report", "EPA-1986-SCH6", "monthly", "environmental_officer"),
            ("Gas & Air Quality Inspection (PM10/SPM)", "CMR-2017-REG5", "monthly", "safety_officer"),
            ("Quarterly Dust Suppression Compliance", "CMR-2017-REG106", "quarterly", "mine_manager"),
            ("Mine Water Discharge Quality Check", "EPA-1986-SCH6", "monthly", "environmental_officer")
        ]
        
        req_ids = []
        for r in reqs:
            req_id = uid()
            req_ids.append(req_id)
            cur.execute(
                "INSERT INTO compliance_requirements (id, title, regulation_id, recurrence, applicable_mine_types, responsible_role) VALUES (%s, %s, %s, %s::recurrence_enum, %s::mine_type_enum[], %s::responsible_role_enum)",
                (req_id, r[0], reg_ids[r[1]], r[2], ["opencast", "underground"], r[3])
            )
            
        # Add instances for Sept 2026
        # Monthly Environmental Monitoring
        cur.execute(
            "INSERT INTO compliance_instances (id, requirement_id, mine_id, due_date, status, period_start, period_end) VALUES (%s, %s, %s, %s, %s::instance_status, %s, %s)",
            (SAFETY_INSTANCE_ID, req_ids[0], MINE_ID, datetime.date(2026, 9, 20), "pending", datetime.date(2026, 9, 1), datetime.date(2026, 9, 30))
        )
        # Gas & Air Quality
        cur.execute(
            "INSERT INTO compliance_instances (id, requirement_id, mine_id, due_date, status, period_start, period_end) VALUES (%s, %s, %s, %s, %s::instance_status, %s, %s)",
            (uid(), req_ids[1], MINE_ID, datetime.date(2026, 9, 15), "pending", datetime.date(2026, 9, 1), datetime.date(2026, 9, 30))
        )
        # Quarterly Dust Suppression
        cur.execute(
            "INSERT INTO compliance_instances (id, requirement_id, mine_id, due_date, status, period_start, period_end) VALUES (%s, %s, %s, %s, %s::instance_status, %s, %s)",
            (uid(), req_ids[2], MINE_ID, datetime.date(2026, 9, 30), "pending", datetime.date(2026, 7, 1), datetime.date(2026, 9, 30))
        )
        # Mine Water Discharge
        cur.execute(
            "INSERT INTO compliance_instances (id, requirement_id, mine_id, due_date, status, period_start, period_end) VALUES (%s, %s, %s, %s, %s::instance_status, %s, %s)",
            (uid(), req_ids[3], MINE_ID, datetime.date(2026, 9, 25), "pending", datetime.date(2026, 9, 1), datetime.date(2026, 9, 30))
        )

        conn.commit()
        print("Demo seed complete!")

    except Exception as e:
        conn.rollback()
        print(f"Error seeding data: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_demo()

"""
COMET Platform - Comprehensive Database Seed Script
====================================================
Generates 3 months of realistic operational data (June-August 2026)
across 3 coal mines: Umrer OCP (WCL), Sillewara UG (WCL), Gevra OCP (SECL).

Usage:
    conda activate sih2026
    pip install psycopg2-binary python-dotenv
    python seed.py

Reads DATABASE_URL from .env (asyncpg:// is auto-converted to postgresql://).
"""
import os, sys, uuid, json, random, datetime, calendar

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
rng = random.Random(42)

def uid():        return str(uuid.uuid4())
def pick(seq):    return rng.choice(seq)
def rint(a, b):   return rng.randint(a, b)
def ufloat(a, b): return round(rng.uniform(a, b), 2)

BASE_DT = datetime.datetime(2026, 9, 1, 8, 0, 0, tzinfo=datetime.timezone.utc)
BASE_D  = datetime.date(2026, 9, 1)
def ts_ago(days, hours=0): return BASE_DT - datetime.timedelta(days=days, hours=hours)
def d_ago(days):           return BASE_D - datetime.timedelta(days=days)

ORG_CIL    = "00000000-0000-0000-0000-000000000001"
SUB_WCL    = "00000000-0000-0000-0000-000000000002"
SUB_SECL   = "00000000-0000-0000-0000-000000000003"
MINE_UMRER = "00000000-0000-0000-0000-000000000004"
MINE_SILL  = "00000000-0000-0000-0000-000000000005"
MINE_GEVRA = "00000000-0000-0000-0000-000000000006"
U_ADMIN    = "00000000-0000-0000-0000-000000000010"
U_WCL_ADM  = "00000000-0000-0000-0000-000000000011"

MINES = [
    {"id": MINE_UMRER, "sub": SUB_WCL,  "name": "Umrer OCP",    "type": "opencast",    "state": "Maharashtra",  "district": "Nagpur",  "lat": 20.9232, "lng": 79.3152},
    {"id": MINE_SILL,  "sub": SUB_WCL,  "name": "Sillewara UG", "type": "underground", "state": "Maharashtra",  "district": "Nagpur",  "lat": 20.9512, "lng": 79.2841},
    {"id": MINE_GEVRA, "sub": SUB_SECL, "name": "Gevra OCP",    "type": "opencast",    "state": "Chhattisgarh", "district": "Korba",   "lat": 22.3619, "lng": 82.6862},
]

def make_users():
    rows = []
    def u(mid, sid, name, email, desig, role):
        rows.append({"id": uid(), "mine_id": mid, "sub_id": sid,
                     "full_name": name, "email": email, "designation": desig, "role": role})
    u(MINE_UMRER,SUB_WCL,  "Rajesh Kumar",    "rajesh.k@wcl.in",       "Mine Manager",          "mine_manager")
    u(MINE_UMRER,SUB_WCL,  "Priya Sharma",    "priya.s@wcl.in",        "Safety Officer",        "safety_officer")
    u(MINE_UMRER,SUB_WCL,  "Anand Verma",     "anand.v@wcl.in",        "Environmental Officer", "environmental_officer")
    u(MINE_UMRER,SUB_WCL,  "Sunil Patil",     "sunil.p@wcl.in",        "Field Officer",         "field_officer")
    u(MINE_UMRER,SUB_WCL,  "Meera Desai",     "meera.d@wcl.in",        "Compliance Officer",    "compliance_officer")
    u(MINE_UMRER,SUB_WCL,  "Rohit Nair",      "rohit.n@wcl.in",        "Contractor Manager",    "contractor_manager")
    u(MINE_SILL, SUB_WCL,  "Vikram Singh",    "vikram.s@wcl.in",       "Mine Manager",          "mine_manager")
    u(MINE_SILL, SUB_WCL,  "Deepa Rao",       "deepa.r@wcl.in",        "Safety Officer",        "safety_officer")
    u(MINE_SILL, SUB_WCL,  "Aditya Mishra",   "aditya.m@wcl.in",       "Field Officer",         "field_officer")
    u(MINE_SILL, SUB_WCL,  "Kavita Joshi",    "kavita.j@wcl.in",       "Environmental Officer", "environmental_officer")
    u(MINE_SILL, SUB_WCL,  "Harish Tiwari",   "harish.t@wcl.in",       "Compliance Officer",    "compliance_officer")
    u(MINE_GEVRA,SUB_SECL, "Satish Gupta",    "satish.g@secl.in",      "Mine Manager",          "mine_manager")
    u(MINE_GEVRA,SUB_SECL, "Poonam Yadav",    "poonam.y@secl.in",      "Safety Officer",        "safety_officer")
    u(MINE_GEVRA,SUB_SECL, "Ramesh Dubey",    "ramesh.d@secl.in",      "Environmental Officer", "environmental_officer")
    u(MINE_GEVRA,SUB_SECL, "Ajay Pandey",     "ajay.p@secl.in",        "Field Officer",         "field_officer")
    u(MINE_GEVRA,SUB_SECL, "Neha Sinha",      "neha.si@secl.in",       "Contractor Manager",    "contractor_manager")
    u(MINE_GEVRA,SUB_SECL, "Manoj Chaudhary", "manoj.c@secl.in",       "Compliance Officer",    "compliance_officer")
    u(None,None, "Dr. Arvind Sharma", "arvind.s@coalindia.in", "Corporate Executive", "corporate_executive")
    u(None,None, "DGMS Inspector",    "insp@dgms.gov.in",      "Regulator",           "regulator")
    return rows

def seed():
    print("\n Seeding COMET Database -- connecting ...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT id, name FROM roles")
        roles_db = {r["name"]: str(r["id"]) for r in cur.fetchall()}
        print(f"   Found {len(roles_db)} roles in DB")

        print("   [1/19] Seeding users ...")
        user_list  = make_users()
        mine_users = {m["id"]: [] for m in MINES}
        for u in user_list:
            cur.execute(
                "INSERT INTO users (id, full_name, email, mine_id, subsidiary_id, designation, is_active)"
                " VALUES (%s,%s,%s,%s,%s,%s,true) ON CONFLICT (id) DO NOTHING",
                (u["id"], u["full_name"], u["email"], u["mine_id"], u["sub_id"], u["designation"]),
            )
            role_id = roles_db.get(u["role"])
            if role_id:
                cur.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                            (u["id"], role_id))
            if u["mine_id"] and u["mine_id"] in mine_users:
                mine_users[u["mine_id"]].append(u)
        conn.commit()
        print(f"      => {len(user_list)} users")

        def get_u(mine_id, role):
            for uu in mine_users.get(mine_id, []):
                if uu["role"] == role:
                    return uu["id"]
            return U_ADMIN

        print("   [2/19] Seeding monitoring stations ...")
        station_ids = {m["id"]: [] for m in MINES}
        STATION_DEFS = [
            ("North CAAQMS Station",  "caaqms_air",     True),
            ("South Dust Sampler",    "dust_sampler",   False),
            ("Pit Sump Water Point",  "water_effluent", False),
            ("Site Noise Monitor",    "noise",          True),
        ]
        for mine in MINES:
            for sname, stype, iot in STATION_DEFS:
                sid = uid()
                cur.execute(
                    "INSERT INTO monitoring_stations"
                    " (id, mine_id, station_type, name, location, is_iot_enabled, is_active)"
                    " VALUES (%s,%s,%s,%s,%s,%s,true)",
                    (sid, mine["id"], stype,
                     f"{mine['name']} - {sname}",
                     json.dumps({"lat": round(mine["lat"] + rng.uniform(-0.05,0.05),6),
                                 "lng": round(mine["lng"] + rng.uniform(-0.05,0.05),6)}),
                     iot))
                station_ids[mine["id"]].append(sid)
        conn.commit()
        print(f"      => {len(MINES)*4} stations")

        print("   [3/19] Seeding environment readings (90 days) ...")
        ENV_PARAMS = [
            ("pm10",    "ug/m3",  45,   90,  100,  0.08),
            ("pm2_5",   "ug/m3",  20,   50,   60,  0.06),
            ("so2",     "ug/m3",  15,   60,   80,  0.04),
            ("noise_db","dB(A)",  52,   74,   75,  0.10),
            ("ph",      "units",  6.5,  8.5, None, 0.02),
            ("tss",     "mg/L",   35,   88,  100,  0.07),
        ]
        env_n = 0
        for mine in MINES:
            stns = station_ids[mine["id"]]
            env_off = get_u(mine["id"], "environmental_officer")
            rows_buf = []
            for day_off in range(90):
                dt = ts_ago(90 - day_off, rint(0, 7))
                for param, unit, lo, hi, limit, bp in ENV_PARAMS:
                    if rng.random() < 0.28:
                        continue
                    mult = 1.22 if rng.random() < bp else 1.0
                    val  = round(rng.uniform(lo, hi * mult), 2)
                    breached = (limit is not None) and (val > limit)
                    bsev = ("high" if breached and val > (limit or 0)*1.1 else "medium" if breached else None)
                    rows_buf.append((uid(), mine["id"], pick(stns), param, val, unit, dt,
                                     pick(["sensor_iot","manual","manual"]),
                                     limit, breached, bsev, env_off))
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO environment_readings"
                " (id,mine_id,station_id,parameter,value,unit,recorded_at,"
                "  source,prescribed_limit,threshold_breached,breach_severity,recorded_by)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", rows_buf)
            env_n += len(rows_buf)
            conn.commit()
        print(f"      => {env_n} environment readings")

        print("   [4/19] Seeding production readings (90 days x 3 shifts) ...")
        DAILY_TGT = {MINE_UMRER: 8000, MINE_SILL: 3500, MINE_GEVRA: 12000}
        prod_n = 0
        for mine in MINES:
            target = DAILY_TGT[mine["id"]]
            mgr    = get_u(mine["id"], "mine_manager")
            rows_buf = []
            for day_off in range(90):
                rep = d_ago(90 - day_off)
                for shift in ["A","B","C"]:
                    factor = rng.gauss(0.33, 0.04)
                    qty    = round(max(0, target * factor), 1)
                    rows_buf.append((uid(), mine["id"], mine["sub"], rep, shift,
                                     qty, pick(["G4","G5","G6","G7"]),
                                     pick(["Seam I","Seam II","Seam III","Seam IV"]),
                                     "mobile_app",
                                     round(qty * rng.uniform(4.5,5.5),1) if mine["type"]=="opencast" else None,
                                     rint(80,300), mgr, abs(factor-0.33)>0.10))
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO production_readings"
                " (id,mine_id,subsidiary_id,reporting_date,shift,quantity_tonnes,"
                "  coal_grade,seam_name,source,overburden_cum,workforce_count,reported_by,anomaly_flagged)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", rows_buf)
            prod_n += len(rows_buf)
            conn.commit()
        print(f"      => {prod_n} production readings")

        print("   [5/19] Seeding contractors, workers, documents ...")
        CONTRACTOR_DEFS = [
            ("M/s Rameshwar Enterprises",    "REG-MH-2019-0041", "AAACR1234C", "27AAACR1234C1ZV"),
            ("M/s Shree Mining Services",    "REG-MH-2021-0087", "BBBSM5678D", "27BBBSM5678D1ZQ"),
            ("M/s Bharat Earth Movers Ltd.", "REG-CG-2018-0023", "CCCBE9012E", "22CCCBE9012E1ZP"),
            ("M/s Korba Infra Pvt Ltd",      "REG-CG-2020-0055", "DDDKI3456F", "22DDDKI3456F1ZA"),
            ("M/s National Drilling Co.",    "REG-MH-2017-0011", "EEEND7890G", "27EEEND7890G1ZB"),
            ("M/s Apex Safety Solutions",    "REG-MH-2022-0098", "FFFAS2345H", "27FFFAS2345H1ZC"),
        ]
        contractor_ids = []
        for cname, creg, cpan, cgst in CONTRACTOR_DEFS:
            cid   = uid()
            trust = ufloat(55, 92)
            risk  = "low" if trust>80 else ("medium" if trust>65 else "high")
            cur.execute(
                "INSERT INTO contractors"
                " (id,name,registration_number,pan,gst_number,contact_person,"
                "  contact_email,address,status,risk_rating,trust_score,onboarded_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'active',%s,%s,%s)"
                " ON CONFLICT (registration_number) DO NOTHING",
                (cid, cname, creg, cpan, cgst,
                 pick(["Rakesh Jain","Suresh Agarwal","Mukesh Patel","Dinesh Shah"]),
                 f"info@{creg.lower().replace('-','')}.com",
                 pick(["Nagpur","Korba","Raipur","Chandrapur"])+", India",
                 risk, trust, ts_ago(rint(180,540))))
            contractor_ids.append(cid)
        wo = 1
        for mine in MINES:
            for cid in rng.sample(contractor_ids, k=rint(2,4)):
                start = d_ago(rint(60,150))
                end   = start + datetime.timedelta(days=rint(90,365))
                cur.execute(
                    "INSERT INTO contractor_assignments"
                    " (id,contractor_id,mine_id,subsidiary_id,work_order_number,"
                    "  scope_of_work,work_zone,start_date,end_date,max_workers_permitted,status,performance_rating)"
                    " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                    " ON CONFLICT (work_order_number) DO NOTHING",
                    (uid(), cid, mine["id"], mine["sub"],
                     f"WO/{mine['name'][:3].upper()}/2026/{wo:04d}",
                     pick(["Overburden removal","Coal handling plant O&M","Drilling & blasting",
                           "Haul road maintenance","Electrical maintenance","Civil works"]),
                     pick(["North Pit","South Pit","Central Zone","Conveyor Belt Area"]),
                     start, end, rint(50,500),
                     "active" if end>BASE_D else "completed",
                     round(rng.uniform(2.5,5.0),1)))
                wo += 1
        FIRST = ["Ramesh","Suresh","Mahesh","Ganesh","Dinesh","Pavan","Kiran","Vijay","Arun","Raj","Mohan","Santosh"]
        LAST  = ["Kumar","Singh","Sharma","Yadav","Patel","Joshi","Mishra","Verma","Tiwari","Nair","Dubey","Gupta"]
        worker_n = 0
        for cid in contractor_ids:
            for _ in range(rint(15,55)):
                cur.execute(
                    "INSERT INTO contract_workers"
                    " (id,contractor_id,name,worker_id_card_number,age,"
                    "  skill_category,designation,esi_number,epf_number,is_active)"
                    " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                    (uid(), cid, f"{pick(FIRST)} {pick(LAST)}", f"WKR{rint(100000,999999)}",
                     rint(21,55),
                     pick(["Operator","Electrician","Fitter","Welder","Helper","Blaster","Supervisor"]),
                     pick(["Dumper Operator","Electrical Technician","Maintenance Fitter",
                           "Safety Helper","Shotfirer","Jr. Surveyor"]),
                     f"ESI{rint(10**9,10**10-1)}", f"EPF{rint(10**8,10**9-1)}",
                     rng.random()>0.05))
                worker_n += 1
        DOC_TYPES = [("clra_license",365),("esi_registration",365),("epf_registration",365),
                     ("safety_training_certificate",180),("mine_safety_training",365),
                     ("insurance_policy",365),("work_order",180),("labour_license",365),
                     ("gst_certificate",730),("pf_challan",30),("esi_challan",30)]
        for mine in MINES:
            cm = get_u(mine["id"],"contractor_manager")
            for cid in contractor_ids:
                for dtype, vdays in rng.sample(DOC_TYPES, k=rint(5,8)):
                    vfrom  = d_ago(rint(30,200))
                    vuntil = vfrom + datetime.timedelta(days=vdays)
                    dleft  = (BASE_D - vuntil).days
                    dstatus = "expired" if dleft>0 else ("expiring_soon" if -dleft<30 else "valid")
                    did = uid()
                    cur.execute(
                        "INSERT INTO contractor_documents"
                        " (id,contractor_id,doc_type,document_url,valid_from,valid_until,"
                        "  status,is_verified,uploaded_by)"
                        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                        (did, cid, dtype,
                         f"https://storage.coalindia.in/contractor-docs/{did}.pdf",
                         vfrom, vuntil, dstatus, rng.random()>0.2, cm))
        conn.commit()
        print(f"      => {len(contractor_ids)} contractors, {worker_n} workers")

        cur.execute(
            "SELECT cr.id, r.code FROM compliance_requirements cr"
            " JOIN regulations r ON r.id = cr.regulation_id")
        req_by_code = {row["code"]: str(row["id"]) for row in cur.fetchall()}

        print("   [7/19] Seeding compliance instances ...")
        DAILY_CODES   = ["REG-SAF-001","REG-SAF-002","REG-SAF-003","REG-SAF-004","REG-SAF-005","REG-ENV-001"]
        MONTHLY_CODES = ["REG-ENV-002","REG-ENV-003","REG-PRD-001","REG-LAB-001"]
        ANNUAL_CODES  = ["REG-ENV-004","REG-SAF-006"]
        ci_all = []
        inst_n = 0
        for mine in MINES:
            mgr      = get_u(mine["id"],"mine_manager")
            safety   = get_u(mine["id"],"safety_officer")
            env_off  = get_u(mine["id"],"environmental_officer")
            comp_off = get_u(mine["id"],"compliance_officer")
            rows_buf = []
            for day_off in range(90):
                pstart = d_ago(90 - day_off)
                ds     = (BASE_D - pstart).days
                for code in DAILY_CODES:
                    req_id = req_by_code.get(code)
                    if not req_id: continue
                    r = rng.random()
                    if ds==0:   status = "pending" if r<0.5 else "in_progress"
                    elif ds<=1: status = "approved" if r<0.70 else ("in_progress" if r<0.85 else "breached")
                    elif ds<=7: status = "approved" if r<0.80 else ("breached" if r<0.90 else "submitted")
                    else:       status = "approved" if r<0.85 else ("breached" if r<0.93 else "submitted")
                    is_late  = (status=="approved" and ds>1 and rng.random()<0.08)
                    assigned = safety if "SAF" in code else env_off
                    sub_by   = comp_off if status in ("submitted","approved") else None
                    sub_at   = ts_ago(max(0,ds-rint(0,1)),rint(0,5)) if status in ("submitted","approved") else None
                    ci_id    = uid()
                    rows_buf.append((ci_id,req_id,mine["id"],mine["sub"],
                                     pstart,pstart,pstart,status,is_late,assigned,sub_by,sub_at))
                    ci_all.append({"id":ci_id,"mine_id":mine["id"],"status":status})
                    inst_n += 1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO compliance_instances"
                " (id,requirement_id,mine_id,subsidiary_id,"
                "  period_start,period_end,due_date,status,is_late_submission,"
                "  assigned_to,submitted_by,submitted_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", rows_buf)
            conn.commit()
            rows_buf = []
            for mo in [6,7,8]:
                mstart = datetime.date(2026,mo,1)
                mend   = datetime.date(2026,mo,calendar.monthrange(2026,mo)[1])
                due    = mend + datetime.timedelta(days=7)
                ds     = (BASE_D - due).days
                for code in MONTHLY_CODES:
                    req_id = req_by_code.get(code)
                    if not req_id: continue
                    r = rng.random()
                    if ds<0:    status = "pending" if r<0.5 else "in_progress"
                    elif ds<14: status = pick(["submitted","approved","in_progress"])
                    else:       status = "approved" if r<0.75 else "breached"
                    who    = env_off if "ENV" in code else (mgr if "PRD" in code else comp_off)
                    sub_by = comp_off if status in ("submitted","approved") else None
                    sub_at = ts_ago(abs(ds)+rint(0,4)) if status in ("submitted","approved") else None
                    ci_id  = uid()
                    rows_buf.append((ci_id,req_id,mine["id"],mine["sub"],
                                     mstart,mend,due,status,False,who,sub_by,sub_at))
                    ci_all.append({"id":ci_id,"mine_id":mine["id"],"status":status})
                    inst_n += 1
            for code in ANNUAL_CODES:
                req_id = req_by_code.get(code)
                if not req_id: continue
                ci_id  = uid()
                status = pick(["in_progress","pending"])
                who    = env_off if "ENV" in code else safety
                rows_buf.append((ci_id,req_id,mine["id"],mine["sub"],
                                 datetime.date(2026,4,1),datetime.date(2027,3,31),
                                 datetime.date(2027,6,30),status,False,who,None,None))
                ci_all.append({"id":ci_id,"mine_id":mine["id"],"status":status})
                inst_n += 1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO compliance_instances"
                " (id,requirement_id,mine_id,subsidiary_id,"
                "  period_start,period_end,due_date,status,is_late_submission,"
                "  assigned_to,submitted_by,submitted_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", rows_buf)
            conn.commit()
        print(f"      => {inst_n} compliance instances")

        print("   [8/19] Seeding compliance evidences ...")
        ev_n = 0; ev_buf = []
        for ci in ci_all:
            if ci["status"] not in ("submitted","approved"): continue
            for _ in range(rint(1,2)):
                eid = uid()
                ev_buf.append((eid,ci["id"],
                               f"https://storage.coalindia.in/evidences/{eid}.pdf",
                               f"evidence_{eid[:8]}.pdf","application/pdf",
                               rint(50000,2000000),
                               pick(["mobile_capture","web_upload","ocr_scan"]),
                               ci["status"]=="approved"))
                ev_n += 1
        psycopg2.extras.execute_batch(cur,
            "INSERT INTO compliance_evidences"
            " (id,instance_id,document_url,file_name,file_type,file_size_bytes,upload_method,is_verified)"
            " VALUES (%s,%s,%s,%s,%s,%s,%s,%s)", ev_buf)
        conn.commit()
        print(f"      => {ev_n} compliance evidences")

        cur.execute("SELECT id, inspection_type FROM inspection_checklist_templates")
        tmpl_by_type = {}
        for row in cur.fetchall():
            tmpl_by_type.setdefault(row["inspection_type"],[]).append(str(row["id"]))

        print("   [10/19] Seeding inspections ...")
        ITYPE_MAP = {
            "opencast":    ["internal_safety_committee","environmental_pcb","explosives","electrical"],
            "underground": ["dgms_annual_general","dgms_surprise","internal_safety_committee","environmental_pcb","electrical"],
        }
        insp_all = []; insp_buf = []
        for mine in MINES:
            safety  = get_u(mine["id"],"safety_officer")
            env_off = get_u(mine["id"],"environmental_officer")
            itypes  = ITYPE_MAP.get(mine["type"],ITYPE_MAP["opencast"])
            day_ptr = 90
            for i_num in range(18):
                gap = rint(4,6); day_ptr -= gap
                if day_ptr < 0: break
                itype   = pick(itypes)
                tmpl_id = pick(tmpl_by_type.get(itype,[None]))
                started = ts_ago(day_ptr, rint(6,10))
                ds_insp = (BASE_D - started.date()).days
                status  = ("reviewed" if ds_insp>7 else "submitted" if ds_insp>3 else "in_progress")
                completed   = started+datetime.timedelta(hours=rint(2,5)) if status!="in_progress" else None
                submitted_a = (completed+datetime.timedelta(hours=rint(1,24))
                               if completed and status in ("submitted","reviewed") else None)
                viol_cnt = rint(0,4); obs_cnt = viol_cnt+rint(1,6)
                insp_id  = uid()
                cby = safety if any(t in itype for t in ["safety","dgms","explosion","electrical"]) else env_off
                insp_buf.append((insp_id,mine["id"],mine["sub"],cby,itype,tmpl_id,
                                 pick(["North Pit","South Pit","Central Zone","Crusher Area",
                                       "Level 4 Roadway","Return Airway","Face Area"]),
                                 json.dumps({"lat":round(mine["lat"]+rng.uniform(-0.03,0.03),6),
                                             "lng":round(mine["lng"]+rng.uniform(-0.03,0.03),6),
                                             "accuracy_m":rint(3,15)}),
                                 started,completed,submitted_a,status,"synced",obs_cnt,viol_cnt,
                                 pick(["All items checked. Minor deviations noted.",
                                       "Satisfactory. Dust suppression needs attention.",
                                       "Critical violations found in ventilation system.",
                                       "Routine inspection completed without major findings.",
                                       "Follow-up required on roof support compliance.",
                                       "Ambient air quality within permissible limits.",
                                       "Gas detector calibration overdue - flagged to safety officer."])))
                insp_all.append({"id":insp_id,"mine_id":mine["id"],"viol_cnt":viol_cnt,
                                  "obs_cnt":obs_cnt,"status":status,"started":started})
        psycopg2.extras.execute_batch(cur,
            "INSERT INTO inspections"
            " (id,mine_id,subsidiary_id,conducted_by,inspection_type,checklist_template_id,"
            "  zone,geo_stamp,started_at,completed_at,submitted_at,status,sync_status,"
            "  observation_count,violation_count,overall_remarks)"
            " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", insp_buf)
        conn.commit()
        print(f"      => {len(insp_all)} inspections")

        print("   [11/19] Seeding observations / violations / CAPAs ...")
        CAT_MAP = {
            "ventilation":       ["ventilation","methane","airflow"],
            "roof_support":      ["roof_support","strata_control"],
            "blasting":          ["blasting","explosives"],
            "haulage":           ["haulage","vehicle_safety"],
            "electrical_safety": ["electrical"],
            "fire_protection":   ["fire_safety"],
            "general":           ["general","housekeeping","ppe","signage"],
        }
        OBS_DESCS = [
            "Roof support props found inadequate at Face No. 3.",
            "Dust suppression system at crusher not operational.",
            "PPE (dust mask) not worn by workers at drilling point.",
            "Ventilation reading below prescribed limit at Return Airway.",
            "Fire extinguisher on dumper expired - not replaced.",
            "Methane concentration marginally above limit at goaf edge.",
            "Haul road not maintained - significant potholes observed.",
            "Safety signage missing at junction of Level 5 and Main Intake.",
            "Gas detector calibration certificate expired.",
            "Overburden slope angle exceeds approved design.",
            "Good practice: workers observed wearing all PPE correctly.",
            "Ventilation adequate. Air quantity exceeds minimum requirement.",
            "Shot-firing register properly maintained with all entries.",
            "Auxiliary fan duct found collapsed - partial blockage of air.",
            "Fire hydrant pressure tested and found satisfactory.",
        ]
        STAT_REFS = ["CMR 2017, Reg. 100","CMR 2017, Reg. 105","CMR 2017, Reg. 116",
                     "EP Act 1986, Sch VII","Mines Act 1952, Sec 63","CMR 2017, Reg. 82"]
        ROOT_CAUSES = ["Inadequate supervision","Equipment malfunction","Lack of training",
                       "Procedural non-compliance","Resource constraint","Communication gap"]
        obs_n=0; viol_n=0; capa_n=0; capa_all=[]
        for insp in insp_all:
            mid    = insp["mine_id"]
            safety = get_u(mid,"safety_officer")
            mgr    = get_u(mid,"mine_manager")
            sub_id = next(m["sub"] for m in MINES if m["id"]==mid)
            obs_buf=[]; viol_buf=[]; capa_buf=[]
            ovlinks=[]; vclinks=[]
            for idx in range(insp["obs_cnt"]):
                cat    = pick(pick(list(CAT_MAP.values())))
                sev    = pick(["low","low","medium","medium","high","critical"])
                is_viol= idx >= (insp["obs_cnt"]-insp["viol_cnt"])
                obs_id = uid()
                obs_buf.append((obs_id,insp["id"],cat,pick(OBS_DESCS),sev,
                                "non_compliant" if is_viol else "ok",
                                json.dumps({"lat":round(rng.uniform(19.5,22.5),6),
                                            "lng":round(rng.uniform(78.5,82.5),6)}),
                                cat,round(rng.uniform(0.71,0.97),4),
                                rng.random()>0.3,
                                pick(["auto_applied","pending_review","human_verified"])))
                obs_n += 1
                if is_viol:
                    v_sev = ("critical" if sev=="critical" else "major" if sev=="high"
                             else "moderate" if sev=="medium" else "minor")
                    ds_i  = (BASE_D - insp["started"].date()).days
                    v_status = (pick(["reported","under_review"]) if ds_i<5 else
                                pick(["under_review","capa_assigned","in_progress"]) if ds_i<15 else
                                pick(["in_progress","pending_verification","closed","closed"]))
                    viol_id = uid()
                    viol_buf.append((viol_id,obs_id,mid,sub_id,pick(STAT_REFS),
                                     pick(["safety","environment","production","labour"]),
                                     v_sev,f"Violation: {cat} non-compliance.",
                                     v_status,safety,insp["started"],
                                     v_sev in ("major","critical"),rint(0,3)))
                    ovlinks.append((viol_id,obs_id)); viol_n+=1
                    if v_status in ("capa_assigned","in_progress","pending_verification","closed"):
                        capa_due = d_ago(rint(-14,45))
                        od = (BASE_D - capa_due).days
                        cs = ("verified_closed" if v_status=="closed" else
                              pick(["overdue","escalated"]) if od>7 else
                              "completed" if v_status=="pending_verification" else "in_progress")
                        capa_id = uid()
                        comp_at = ts_ago(abs(od)+1) if cs in ("completed","verified_closed") else None
                        capa_buf.append((capa_id,"violation",viol_id,mid,sub_id,
                                         f"Rectify {cat} non-compliance and prevent recurrence.",
                                         "Regular training, supervisor checklist, equipment maintenance.",
                                         safety,mgr,capa_due,cs,
                                         "Corrective action completed and verified." if cs in ("completed","verified_closed") else None,
                                         comp_at,pick(ROOT_CAUSES)))
                        vclinks.append((capa_id,viol_id))
                        capa_all.append({"id":capa_id,"mine_id":mid,"status":cs,"due_date":capa_due})
                        capa_n += 1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO observations (id,inspection_id,category,description,severity,status,"
                " geo_stamp,ai_category,ai_confidence_score,ai_auto_applied,ai_status)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", obs_buf)
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO violations (id,observation_id,mine_id,subsidiary_id,statute_reference,"
                " category,severity,description,status,reported_by,reported_at,"
                " is_regulator_visible,recurrence_count)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", viol_buf)
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO corrective_actions (id,source_type,source_id,mine_id,subsidiary_id,"
                " description,preventive_measures,assigned_to,assigned_by,due_date,status,"
                " completion_notes,completed_at,root_cause)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", capa_buf)
            for viol_id,obs_id in ovlinks:
                cur.execute("UPDATE observations SET violation_id=%s WHERE id=%s",(viol_id,obs_id))
            for capa_id,viol_id in vclinks:
                cur.execute("UPDATE violations SET corrective_action_id=%s WHERE id=%s",(capa_id,viol_id))
        conn.commit()
        print(f"      => {obs_n} observations, {viol_n} violations, {capa_n} CAPAs")

        print("   [12/19] Seeding incident reports ...")
        ITYPES = ["roof_fall","personal_injury","near_miss","equipment_failure",
                  "fire","electrical_incident","haulage_incident","fall_of_person","gas_ignition"]
        INC_DESCS = [
            "Worker sustained minor injury during manual loading operation.",
            "Near-miss: dumper reversed without checking blind spot. No injury.",
            "Small fire at electrical junction box - extinguished by crew.",
            "Roof fall observed at Level 3, Face No. 7. Area barricaded.",
            "Equipment failure - hydraulic pump on Shovel EC-1. Isolated safely.",
            "Gas ignition detected at goaf edge. Workers evacuated immediately.",
            "Fall of person from conveyor maintenance platform (1.5 m height).",
            "Haulage incline rope snapped - no injuries, rope replaced immediately.",
        ]
        inc_n=0; inc_buf=[]
        for mine in MINES:
            safety=get_u(mine["id"],"safety_officer"); fo=get_u(mine["id"],"field_officer")
            for _ in range(rint(10,15)):
                sev=pick(["low","low","medium","medium","high","critical"]); day_off=rint(0,89)
                inc_buf.append((uid(),mine["id"],mine["sub"],pick(ITYPES),pick(INC_DESCS),sev,sev,
                                pick(["roof_fall_injury","near_miss_vehicle","electrical_fire",
                                      "strata_control","equipment_failure","gas_hazard"]),
                                json.dumps({"lat":round(mine["lat"]+rng.uniform(-0.03,0.03),6),
                                            "lng":round(mine["lng"]+rng.uniform(-0.03,0.03),6)}),
                                pick(["North Pit","South Pit","Level 3 East","Conveyor Belt"]),
                                pick(["A","B","C"]),
                                json.dumps([{"name":f"Worker {rint(1,5)}",
                                              "injury":pick(["none","minor","fracture"])}
                                             for _ in range(rint(0,3))]),
                                pick(["Area barricaded. Medical aid given.",
                                      "Machine isolated. Safety officer notified.",
                                      "Fire extinguished. Incident registered.",
                                      "Workers evacuated. Ventilation restored."]),
                                sev in ("high","critical"),pick([safety,fo]),
                                ts_ago(day_off,rint(0,12)),"synced"))
                inc_n+=1
        psycopg2.extras.execute_batch(cur,
            "INSERT INTO incident_reports (id,mine_id,subsidiary_id,incident_type,description,"
            " severity,ai_suggested_severity,ai_suggested_category,geo_stamp,zone,shift,"
            " persons_involved,immediate_actions_taken,is_linked_to_accident_register,"
            " reported_by,reported_at,sync_status)"
            " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", inc_buf)
        conn.commit(); print(f"      => {inc_n} incident reports")

        print("   [13/19] Seeding safety observations ...")
        SO_DESCS=["Worker not wearing hard hat in active zone.",
                  "Oil spill on workshop floor - slip hazard.",
                  "Good practice: pre-shift safety briefing observed.",
                  "Barricading tape missing at open excavation.",
                  "Portable fire extinguisher missing from designated location.",
                  "Emergency exit route blocked by stacked materials.",
                  "Workers correctly using lockout/tagout procedure - commended.",
                  "High-visibility vest not worn near vehicle movement area.",
                  "Electrical panel door left open - shock hazard.",
                  "Handrails on stairway to crusher platform missing."]
        so_n=0
        for mine in MINES:
            fo=get_u(mine["id"],"field_officer"); safety=get_u(mine["id"],"safety_officer")
            so_buf=[]
            for _ in range(rint(250,320)):
                day_off=rint(0,89); obs_at=ts_ago(day_off,rint(0,12))
                obs_type=pick(["unsafe_act","unsafe_act","unsafe_condition","positive_observation"])
                ds_so=(BASE_D-obs_at.date()).days
                s_status=("open" if ds_so<2 else
                          pick(["open","assigned","corrected"]) if ds_so<7 else
                          pick(["assigned","corrected","corrected","verified_closed"]))
                corrected_at=ts_ago(ds_so-2) if s_status in ("corrected","verified_closed") else None
                so_buf.append((uid(),mine["id"],
                               pick(["North Pit","South Pit","Crushing Plant","Haul Road",
                                     "Level 3","Main Intake","Surface Store"]),
                               obs_type,
                               pick(["ppe","housekeeping","equipment","signage",
                                     "electrical","chemical","ergonomics"]),
                               pick(SO_DESCS),
                               json.dumps({"lat":round(mine["lat"]+rng.uniform(-0.03,0.03),6),
                                           "lng":round(mine["lng"]+rng.uniform(-0.03,0.03),6)}),
                               safety if s_status in ("assigned","corrected","verified_closed") else None,
                               s_status,corrected_at,pick([fo,safety]),obs_at,"synced"))
                so_n+=1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO safety_observations"
                " (id,mine_id,zone,observation_type,category,description,"
                "  geo_stamp,assigned_to,status,corrected_at,observed_by,observed_at,sync_status)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", so_buf)
            conn.commit()
        print(f"      => {so_n} safety observations")

        print("   [14/19] Seeding alerts ...")
        ALERT_TMPLS=[
            ("critical","env_breach","CRITICAL: Environmental Threshold Breached",
             "PM10 reading at {mine} CAAQMS exceeded 100 ug/m3. Immediate action required."),
            ("high","capa_overdue","CAPA Overdue - Escalation Required",
             "Corrective action at {mine} is overdue by 3+ days. Escalating to Mine Manager."),
            ("high","compliance_breached","Compliance Task Overdue",
             "Statutory compliance task at {mine} has breached its due date. Review required."),
            ("medium","doc_expiring","Contractor Document Expiring Soon",
             "Contractor document at {mine} expiring in 7 days. Renewal required."),
            ("medium","violation_raised","New Violation Reported",
             "A major violation has been logged at {mine}. Review and assign CAPA."),
            ("low","inspection_reminder","Inspection Due Reminder",
             "Scheduled inspection at {mine} is due in 2 days. Assign field officer."),
            ("info","sync_completed","Mobile Sync Completed",
             "Field data sync from {mine} completed. 12 records uploaded."),
        ]
        alert_n=0
        for mine in MINES:
            mgr=get_u(mine["id"],"mine_manager"); safety=get_u(mine["id"],"safety_officer")
            env_off=get_u(mine["id"],"environmental_officer"); al_buf=[]
            for _ in range(rint(40,60)):
                priority,atype,title,msg=pick(ALERT_TMPLS)
                day_off=rint(0,89); created=ts_ago(day_off,rint(0,12))
                ds_a=(BASE_D-created.date()).days
                a_status=("acknowledged" if ds_a>3 else "read" if ds_a>1 else pick(["pending","sent","delivered"]))
                target=pick([mgr,safety,env_off])
                sent_at=created+datetime.timedelta(minutes=rint(1,5)) if a_status!="pending" else None
                read_at=created+datetime.timedelta(hours=rint(1,4)) if a_status in ("read","acknowledged") else None
                SLA={"critical":30,"high":120,"medium":480,"low":None,"info":None}
                al_buf.append((uid(),priority,atype,title,msg.format(mine=mine["name"]),
                               target,pick(["mine_manager","safety_officer","environmental_officer"]),
                               mine["id"],pick(["violation","compliance_instance","corrective_action",None]),
                               ["in_app","push"] if priority in ("critical","high") else ["in_app"],
                               SLA[priority],a_status,sent_at,read_at,created))
                alert_n+=1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO alerts (id,priority,type,title,message,target_user_id,target_role,"
                " mine_id,entity_type,channels,sla_response_minutes,status,sent_at,read_at,created_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", al_buf)
            conn.commit()
        print(f"      => {alert_n} alerts")

        print("   [15/19] Seeding mine risk scores ...")
        RISK_BASE={MINE_UMRER:45.0,MINE_SILL:62.0,MINE_GEVRA:38.0}
        score_n=0
        for mine in MINES:
            base=RISK_BASE[mine["id"]]; prev=None; rs_buf=[]
            for snap in range(45):
                day_off=snap*2; comp_at=ts_ago(90-day_off,rint(0,5))
                score=round(max(10,min(95,base+rng.gauss(0,4))),2)
                risk_lvl=("critical" if score>75 else "high" if score>55 else "medium" if score>35 else "low")
                trend=("worsening" if prev and score>prev+2 else "improving" if prev and score<prev-2 else "stable")
                factors=[{"feature":"violation_count_90d","weight":0.34,"value":rint(2,15),"comparison":"vs 5 avg"},
                         {"feature":"capa_avg_closure_days","weight":0.28,"value":round(rng.uniform(3,12),1),"comparison":"vs 7 target"},
                         {"feature":"env_breach_count_30d","weight":0.18,"value":rint(0,5),"comparison":"vs 1 avg"},
                         {"feature":"capa_overdue_count","weight":0.12,"value":rint(0,6),"comparison":"current"},
                         {"feature":"grievance_open_count","weight":0.08,"value":rint(0,8),"comparison":">7 days"}]
                rs_buf.append((uid(),mine["id"],mine["sub"],score,risk_lvl,
                               json.dumps(factors),trend,prev,"xgb-v2.1",comp_at))
                prev=score; base=score; score_n+=1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO mine_risk_scores (id,mine_id,subsidiary_id,score,risk_level,"
                " contributing_factors,trend,previous_score,model_version,computed_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", rs_buf)
            conn.commit()
        print(f"      => {score_n} risk score snapshots")

        print("   [16/19] Seeding anomaly flags ...")
        ATYPES=["production_anomaly","environmental_anomaly","attendance_anomaly","sensor_malfunction","billing_anomaly"]
        anom_n=0
        for mine in MINES:
            mgr=get_u(mine["id"],"mine_manager"); af_buf=[]
            for _ in range(rint(8,15)):
                day_off=rint(0,89); detected=ts_ago(day_off,rint(0,12))
                sev=pick(["low","medium","high","critical"])
                expected=round(rng.uniform(100,5000),2); actual=round(expected*rng.uniform(0.60,1.40),2)
                deviation=round((actual-expected)/expected*100,2)
                ack=(BASE_D-detected.date()).days>3 and rng.random()>0.4
                af_buf.append((uid(),mine["id"],mine["sub"],pick(ATYPES),
                               pick(["production_readings","environment_readings","attendance_records","sensor_iot"]),
                               sev,f"Anomaly detected: {abs(deviation):.1f}% deviation from expected value.",
                               pick(["shift_production_tonnes","pm10_daily_avg","workforce_headcount","sensor_delta","billing_per_unit"]),
                               expected,actual,deviation,round(rng.uniform(0.75,0.98),4),
                               ack,mgr if ack else None,ts_ago(day_off-1) if ack else None,
                               "xgb-v2.1",detected))
                anom_n+=1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO anomaly_flags (id,mine_id,subsidiary_id,anomaly_type,data_source,severity,"
                " description,metric_name,expected_value,actual_value,deviation_pct,confidence,"
                " is_acknowledged,acknowledged_by,acknowledged_at,model_version,detected_at)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", af_buf)
            conn.commit()
        print(f"      => {anom_n} anomaly flags")

        print("   [17/19] Seeding document uploads + OCR ...")
        DOC_CATS=["dgms_inspection_memo","accident_register","environmental_report","contractor_license",
                  "production_return","safety_committee_minutes","attendance_muster","explosive_return",
                  "statutory_form","legacy_register"]
        ocr_n=0
        for mine in MINES:
            comp_off=get_u(mine["id"],"compliance_officer"); du_buf=[]; oe_buf=[]
            for _ in range(rint(20,35)):
                day_off=rint(0,89); doc_cat=pick(DOC_CATS)
                ocr_stat=pick(["completed","completed","completed","awaiting_review","processing"])
                conf=round(rng.uniform(0.65,0.97),4)
                verify=("auto_accepted" if conf>=0.85 and ocr_stat=="completed" else
                        "pending_review" if ocr_stat in ("awaiting_review","processing") else "human_verified")
                du_id=uid(); ocr_id=uid()
                du_buf.append((du_id,f"https://storage.coalindia.in/ocr-uploads/{du_id}.pdf",
                               f"{doc_cat}_{du_id[:8]}.pdf","application/pdf",
                               rint(80000,3000000),doc_cat,mine["id"],ocr_stat,comp_off))
                if ocr_stat in ("completed","awaiting_review"):
                    extracted=[{"field":"date","value":str(d_ago(day_off)),"confidence":round(rng.uniform(0.7,0.99),4)},
                               {"field":"mine_name","value":mine["name"],"confidence":round(rng.uniform(0.7,0.99),4)},
                               {"field":"quantity","value":str(rint(100,9999)),"confidence":round(rng.uniform(0.6,0.99),4)},
                               {"field":"reference","value":f"REF/{rint(1000,9999)}","confidence":round(rng.uniform(0.6,0.99),4)}]
                    oe_buf.append((ocr_id,du_id,"tesseract-5",doc_cat,
                                   f"[Raw OCR text from {doc_cat} at {mine['name']}.]",
                                   json.dumps(extracted),conf,verify,
                                   comp_off if verify=="human_verified" else None,rint(1200,8500)))
                    ocr_n+=1
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO document_uploads (id,file_url,file_name,file_type,file_size_bytes,"
                " document_category,mine_id,ocr_status,uploaded_by)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)", du_buf)
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO ocr_extraction_results (id,document_id,ocr_engine,template_matched,"
                " raw_text,extracted_fields,overall_confidence,verification_status,verified_by,processing_time_ms)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", oe_buf)
            conn.commit()
        print(f"      => {ocr_n} OCR results")

        print("   [18/19] Seeding escalation workflow instances ...")
        FAKE_TMPL="aaaaaaaa-0000-0000-0000-000000000001"; esc_n=0; esc_buf=[]; capa_esc=[]
        for capa in [c for c in capa_all if c["status"] in ("overdue","escalated")]:
            mid=capa["mine_id"]; mgr=get_u(mid,"mine_manager")
            sub_id=next(m["sub"] for m in MINES if m["id"]==mid)
            od=max(1,(BASE_D-capa["due_date"]).days)
            esc_status=("escalated_level_2" if od>=7 else "escalated_level_1" if od>=3 else "overdue")
            history=[{"level":0,"assignee":mgr,"escalated_at":str(ts_ago(od)),"reason":"CAPA overdue - auto-escalation"}]
            if "escalated" in esc_status:
                history.append({"level":1,"assignee":U_WCL_ADM,"escalated_at":str(ts_ago(od-3)),
                                  "reason":"Unresolved after 3 days - escalated to Subsidiary Admin"})
            esc_id=uid()
            esc_buf.append((esc_id,FAKE_TMPL,"corrective_action",capa["id"],mid,sub_id,capa["due_date"],
                            2 if esc_status=="escalated_level_2" else 1 if "escalated" in esc_status else 0,
                            U_WCL_ADM if "escalated" in esc_status else mgr,
                            esc_status,json.dumps(history)))
            capa_esc.append((esc_id,capa["id"])); esc_n+=1
        if esc_buf:
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO escalation_workflow_instances (id,workflow_template_id,entity_type,entity_id,"
                " mine_id,subsidiary_id,due_date,current_level,current_assignee_id,status,history)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", esc_buf)
        for esc_id,capa_id in capa_esc:
            cur.execute("UPDATE corrective_actions SET escalation_workflow_id=%s WHERE id=%s",(esc_id,capa_id))
        conn.commit(); print(f"      => {esc_n} escalation workflow instances")

        print("   [19/19] Seeding model feedback + media attachments ...")
        cur.execute("SELECT id FROM observations WHERE ai_auto_applied = true LIMIT 100")
        obs_sample=[str(r["id"]) for r in cur.fetchall()]
        fb_buf=[]
        for obs_id in rng.sample(obs_sample, min(35,len(obs_sample))):
            mine_id=pick([m["id"] for m in MINES]); safety=get_u(mine_id,"safety_officer")
            fb_buf.append((uid(),obs_id,
                           pick(["ventilation","roof_support","blasting","haulage","electrical"]),
                           round(rng.uniform(0.55,0.84),4),
                           pick(["roof_support","ventilation","general","electrical"]),
                           safety,ts_ago(rint(1,60)),rng.random()>0.5))
        if fb_buf:
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO model_feedback (id,observation_id,original_ai_category,"
                " original_ai_confidence,corrected_category,corrected_by,corrected_at,used_in_training)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s)", fb_buf)
        med_buf=[]
        for capa in capa_all[:40]:
            mid=capa["mine_id"]; safety=get_u(mid,"safety_officer")
            for _ in range(rint(1,3)):
                m_id=uid()
                med_buf.append((m_id,"corrective_action",capa["id"],pick(["photo","photo","video"]),
                                f"https://storage.coalindia.in/media/{m_id}.jpg",
                                rint(200000,5000000),pick(["image/jpeg","image/png","video/mp4"]),
                                json.dumps({"lat":round(rng.uniform(19.5,22.5),6),
                                            "lng":round(rng.uniform(78.5,82.5),6)}),
                                "uploaded",safety))
        if med_buf:
            psycopg2.extras.execute_batch(cur,
                "INSERT INTO media_attachments (id,parent_type,parent_id,media_type,file_url,"
                " file_size_bytes,mime_type,geo_stamp,sync_status,captured_by)"
                " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", med_buf)
        conn.commit()
        print(f"      => {len(fb_buf)} model feedback, {len(med_buf)} media attachments")

        print("\n" + "="*60)
        print(" COMET Database Seeding COMPLETE")
        print("="*60)
        print(f"  Period       : June - August 2026 (90 days)")
        print(f"  Mines        : 3 (Umrer OCP, Sillewara UG, Gevra OCP)")
        print(f"  Users        : {len(user_list)}")
        print(f"  Env readings : {env_n}")
        print(f"  Prod readings: {prod_n}")
        print(f"  Contractors  : {len(contractor_ids)}, Workers: {worker_n}")
        print(f"  Compliance   : {inst_n} instances, {ev_n} evidences")
        print(f"  Inspections  : {len(insp_all)}")
        print(f"  Observations : {obs_n}, Violations: {viol_n}, CAPAs: {capa_n}")
        print(f"  Incidents    : {inc_n}")
        print(f"  Safety obs   : {so_n}")
        print(f"  Alerts       : {alert_n}")
        print(f"  Risk scores  : {score_n}")
        print(f"  Anomaly flags: {anom_n}")
        print(f"  OCR results  : {ocr_n}")
        print(f"  Escalations  : {esc_n}")
        print("="*60)

    except Exception as exc:
        conn.rollback()
        print(f"\nSeed failed: {exc}")
        import traceback; traceback.print_exc()
        sys.exit(1)
    finally:
        cur.close(); conn.close()

if __name__ == "__main__":
    seed()

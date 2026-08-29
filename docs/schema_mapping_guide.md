# SGCMP Schema Mapping Guide: Digital Twins of Statutory Forms

This guide explains the philosophy and structure behind the JSON schemas created for the Smart Governance & Compliance Monitoring Platform (SGCMP). 

The core architectural principle of these schemas is that they act as **Digital Twins** of the legally prescribed statutory forms and registers under Indian mining laws (Mines Act 1952, CMR 2017, CLRA 1970). 

By ensuring a strict **1-to-1 mapping** between the digital JSON properties and the physical form columns, the platform guarantees regulatory compliance, enables seamless OCR digitization, and allows for the automated generation of printable official documents.

---

## The 1-to-1 Mapping Philosophy

In the mining sector, regulatory bodies like the DGMS (Directorate General of Mines Safety) do not accept arbitrary data formats. If a mine must report an accident, they cannot simply send an email; they must submit the exact fields prescribed in **Form 4-A**. 

Therefore, every compliance-related schema in our system is designed by looking at the official gazette notification of the form and translating each column into a strongly-typed JSON property.

### Benefits of this Approach:
1. **Automated Document Generation:** Because the JSON holds the exact data points required, the backend can easily populate a PDF template of the official form and generate a legally compliant document for submission.
2. **Deterministic OCR Pipeline:** When scanning legacy paper records, the OCR engine knows exactly what fields to look for (e.g., it expects a "Date", a "Shift", and a "Signature" exactly where the schema dictates).
3. **Frictionless UI Generation:** The frontend can read the schema and auto-generate forms that mirror the paper registers the mine officials are already used to filling out, reducing the training burden.

---

## Key Schema Mappings Explained

Below are examples of how specific JSON schemas map directly to their statutory counterparts.

### 1. Accident Reporting
* **Statutory Requirement:** Mines Act 1952 (Sec 23), CMR 2017 (Regulation 8)
* **Prescribed Forms:** Form 4-A (Notice), Form 4-B (Particulars of Deceased/Injured), Form 4-C (Return to Duty)
* **Digital Twin:** `sgcmp/accident_register_entry.schema.json`

**How it maps:**
The `AccidentRegisterEntry` schema is a composite that captures the lifecycle of all three forms. 
* **Form 4-A Mapping:** The schema fields `occurrence_type`, `date_of_occurrence`, `time_of_occurrence`, `location_in_mine`, and `description` map directly to the initial notice requirements of Form 4-A.
* **Form 4-B Mapping:** The array `persons_affected` maps 1-to-1 with Form 4-B. It requires `name`, `employee_type`, `nature_of_injury`, and `outcome` for every individual involved in the accident.
* **Form 4-C Mapping:** Inside the `persons_affected` array, the field `return_to_duty_date` maps to the Form 4-C requirement to track when the worker is fit to return.

### 2. DGMS Inspection & Contraventions
* **Statutory Requirement:** CMR 2017 (Regulation 117)
* **Prescribed Form:** Form 6 (Pointing out contraventions)
* **Digital Twin:** `sgcmp/violation.schema.json` and `sgcmp/inspection.schema.json`

**How it maps:**
When a DGMS inspector issues a Form 6, they are legally required to cite the specific law violated and give a deadline for rectification.
* **Form 6 Fields:** The `Violation` schema captures this precisely with `statute_reference` (e.g., "CMR 2017 Reg 117") and `description`.
* **Action Taken:** The schema links to a `corrective_action_id` (CAPA), which mirrors the management's legal obligation to reply to the Form 6 detailing the rectifications made.

### 3. Manager & Overman Daily Logs
* **Statutory Requirement:** CMR 2017 (Regulations 17, 18, 28)
* **Prescribed Format:** Manager's Record Book, Shift Inspection Book (Danger Notice Book)
* **Digital Twin:** `sgcmp/overman_report.schema.json`

**How it maps:**
Underground officials must maintain shift-wise physical logbooks. 
* **Shift Details:** The schema enforces `shift`, `zone`, and `reported_by` to match the header of the physical logbook.
* **Statutory Readings:** The `ventilation_readings` array (capturing `air_velocity_mps`, `methane_pct`, `co2_pct`) maps exactly to the mandatory gas and ventilation test columns in the Danger Notice Book.

### 4. Contractor & Labour Management
* **Statutory Requirement:** Contract Labour (Regulation & Abolition) Act, 1970
* **Prescribed Forms:** Form XIII (Register of Workmen), Form XVI (Muster Roll)
* **Digital Twin:** `sgcmp/contract_worker.schema.json`, `sgcmp/attendance_record.schema.json`

**How it maps:**
* **Form XIII (Register):** The `ContractWorker` schema captures `worker_id_card_number` (Form XIV Employment Card), `age`, and `skill_category` exactly as prescribed by CLRA rules.
* **Form XVI (Muster Roll):** The `AttendanceRecord` schema digitizes the daily muster roll. Instead of paper signatures, it uses `check_in_geo_stamp` and `check_in_method` (e.g., biometric) to provide a verifiable digital equivalent of physical attendance.

---

## Mobile Field Reporting & The `GeoStamp`

While not a statutory form itself, the **Mobile Field Reporting** schemas (like `FieldReport`, `SafetyObservation`) are critical to the platform's offline-first architecture.

To ensure the integrity of digital records (preventing officials from filling out inspection forms from their desks instead of in the mine), every field-captured schema embeds a shared `GeoStamp` object:
```json
"geo_stamp": {
  "latitude": "...",
  "longitude": "...",
  "captured_at": "Device-local timestamp",
  "device_id": "..."
}
```
This guarantees that when a digital `OvermanReport` is submitted, it has cryptographic proof (geo-coordinates and device time) that the inspector was physically present in the specified zone, elevating the digital record's legal standing to match or exceed the physical paper logbooks.

---

## Summary

By strictly mirroring the prescribed physical structures, these JSON schemas ensure that SGCMP isn't just a generic task-management tool, but a purpose-built, legally compliant digital backbone for the Indian coal mining industry.

# SAFUU Evidence Tier System

## Tier 1 — Text Only (High threshold)
- What: Written description only, no supporting materials
- How submitted: WhatsApp/Telegram text message
- Threshold: 100 verified reports before name disclosure
- Rationale: Easy to coordinate, hard to verify independently
- Display: "Text submission only · 100 reports required"
- Risk weighting: Low — higher bar to protect against coordination

## Tier 2 — Text + Photo Evidence (Medium threshold)  
- What: Written description + photo (receipt, document, screenshot)
- How submitted: WhatsApp/Telegram text + photo attachment
- Threshold: 15 verified reports before name disclosure
- Rationale: Photos are harder to coordinate, EXIF verifiable
- Display: "Photo evidence submitted · 15 reports required"
- Risk weighting: Medium

## Tier 3 — Text + Financial Evidence (Medium threshold)
- What: Written description + receipt, bank statement, payment record
- How submitted: WhatsApp/Telegram text + document photo
- Threshold: 15 verified reports before name disclosure
- Rationale: Financial documentation is specific and hard to fabricate
- Display: "Financial evidence submitted · 15 reports required"

## Tier 4 — Text + Communication Evidence (Low threshold)
- What: Written description + screenshot of WhatsApp/text demanding money, 
         screenshot of email/letter demanding payment
- How submitted: WhatsApp/Telegram text + screenshot of the demand
- Threshold: 3-5 verified reports before name disclosure
- Rationale: A screenshot of an official demanding money is near-irrefutable
- Display: "Communication evidence (demand documented) · 3-5 reports required"

## Voice — Disabled (future)
- Will use Whisper transcription when activated
- Cost: ~$0.04/minute
- Currently: Intake accepts voice but marks as unprocessed / queued

## Anti-coordination rules (all tiers):
- If >70% of reports on same case arrive within same 6-hour window → flag for review
- If reports use near-identical language (>80% similarity) → coordination flag
- Flagged cases require manual analyst approval before any disclosure
- Region clustering: if reporter pattern suggests single source → hold

## Public display language:
- Tier 1: "Reported: TEXT ONLY" (grey badge)
- Tier 2: "Reported: + PHOTO EVIDENCE" (gold badge)  
- Tier 3: "Reported: + FINANCIAL DOCUMENT" (gold badge)
- Tier 4: "Reported: + DEMAND DOCUMENTED" (red badge — serious)
- Never: names, amounts, or specifics before threshold

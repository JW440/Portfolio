# Security Specification: AutoPro v2 ERP/CRM

## 1. Data Invariants
1. `Client`: Every client must have a non-empty `fullName` and valid `phone`.
2. `WorkOrder`: Every work order must reference a valid `clientId`, specify a valid `vehiclePlate`, `vehicleModel`, `totalAmount` >= 0, and a known status (`in_progress`, `completed`, `on_hold`).
3. `Payment`: Every payment record must reference an existing `workOrderId` and `clientId`, have an `amount` > 0, and non-empty `paymentDate`.
4. `BalanceDue Invariant`: In default mode, `balanceDue = totalAmount - paidAmount`. When `isManualBalanceOverride` is true, an audit explanation in `manualBalanceReason` is required.
5. `Multi-User Team Security`: All authenticated team members can read and create records with audit tracing.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. Missing `fullName` in client document.
2. Injected shadow fields outside schema boundary.
3. Negative `totalAmount` in work order.
4. Unrecognized status code like `'deleted_bad_state'`.
5. Payment amount equal to 0 or negative.
6. Vehicle plate with exceeding string length (> 20 chars).
7. Missing `clientId` foreign key reference in work order.
8. Unauthenticated anonymous write attempt when not allowed.
9. Modifying immutable ID fields or malformed document IDs.
10. Attempt to spoof arbitrary system fields.
11. Payment record without referenced workOrderId.
12. Attempt to write giant binary payloads into notes (> 2000 chars).

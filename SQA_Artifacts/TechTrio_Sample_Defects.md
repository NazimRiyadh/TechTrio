# Sample Defect Reports (Jira Format)

These are professionally written, highly realistic bug reports that demonstrate Senior-Level QA analytical skills.

---

## BUG-201: Race Condition in Inventory Management allows Negative Stock
**Status:** Open | **Priority:** Highest | **Severity:** Critical
**Environment:** Staging / Node.js backend
**Reported By:** Nazim-E-Alam

**Steps to Reproduce:**
1. Locate a product in the database with exactly `Stock: 1`. (e.g., Product ID: 998877)
2. Open two separate browser sessions (User A and User B).
3. Add Product ID: 998877 to the cart in both sessions.
4. Navigate to the final Checkout confirmation step in both sessions.
5. Using a proxy tool (e.g., Burp Suite) or a script, submit the `POST /api/v1/order/new` request for both User A and User B at the exact same millisecond.

**Expected Result:**
The system should employ database locking or atomic operations. The first request should succeed, and the second request should fail with a 400 Bad Request ("Out of Stock").

**Actual Result:**
Both orders are processed successfully. The PostgreSQL inventory table for this product shows `Stock: -1`. 

**Technical Context for Developer:**
This is a classic TOCTOU (Time-of-check to time-of-use) race condition. The `orderController.js` reads the stock, does standard JS math, and then writes it back. Under concurrent load, both threads read `Stock: 1` before either writes the updated value. 
*Recommendation:* Implement a PostgreSQL transaction with row-level locking (`SELECT ... FOR UPDATE`) or handle the decrement atomically in the SQL query (`UPDATE products SET stock = stock - quantity WHERE id = ? AND stock >= quantity`).

---

## BUG-202: Redis Cache poisoning via unescaped query parameters on /products endpoint
**Status:** Open | **Priority:** High | **Severity:** High
**Environment:** Staging
**Reported By:** Nazim-E-Alam

**Steps to Reproduce:**
1. Send a GET request to `/api/v1/products?keyword=laptop`. Observe response time (e.g., 200ms).
2. Send the exact same request again. Observe X-Cache: HIT and response time (e.g., 20ms).
3. Send a GET request to `/api/v1/products?keyword=laptop&dummyparam=123`. 
4. Send another GET request to `/api/v1/products?keyword=laptop&dummyparam=456`.

**Expected Result:**
The Redis cache key generation logic should ignore unrecognized query parameters (like `dummyparam`), serving the cached result for 'laptop'.

**Actual Result:**
Every request with a unique `dummyparam` triggers a full database query and creates a new entry in Redis (Cache MISS). 

**Technical Context for Developer:**
The middleware generating the Redis cache key in `productRoutes.js` is stringifying the entire `req.query` object. An attacker could easily launch a Denial of Service (DoS) attack by sending thousands of requests with random query parameters, bypassing the cache and overflowing Redis memory.
*Recommendation:* Sanitize and whitelist `req.query` parameters before generating the cache key.

---

## BUG-203: RabbitMQ Dead Letter Queue (DLQ) messages not automatically replaying after exponential backoff
**Status:** Resolved | **Priority:** Medium | **Severity:** Medium
**Environment:** Production
**Reported By:** Nazim-E-Alam

**Steps to Reproduce:**
1. Temporarily bring down the Nodemailer email service (simulate outage).
2. Trigger an Order Confirmation event (which publishes to RabbitMQ).
3. The consumer fails to send the email and routes the message to the DLQ.
4. Restore the Nodemailer service.
5. Wait 5 minutes (the configured maximum backoff time).

**Expected Result:**
The system should execute the exponential backoff logic and eventually replay the message from the DLQ back to the main queue for successful processing.

**Actual Result:**
The message remains stuck in the DLQ indefinitely and requires manual intervention via the RabbitMQ Management UI to replay.

**Retest Notes:**
*Update after fix:* Developer corrected the TTL parameters on the DLQ queue configuration in `server/config/rabbitmq.js`. Retested the outage simulation; messages are now successfully re-queued and processed after the backoff period.

;; counter
;; <add a description here>

;; constants
(define-constant contract-owner tx-sender)
(define-constant err-not-positive (err u100))

;; data vars
(define-data-var counter uint u0)

;; public functions
(define-public (increment (amount uint))
  (begin
    (var-set counter (+ (var-get counter) amount))
    (ok (var-get counter))
  )
)

(define-public (decrement (amount uint))
  (let ((current-count (var-get counter)))
    (asserts! (>= current-count amount) err-not-positive)
    (var-set counter (- current-count amount))
    (ok (var-get counter))
  )
)

(define-public (reset)
  (begin
    (var-set counter u0)
    (ok (var-get counter))
  )
)

;; read only functions
(define-read-only (get-count)
  (ok (var-get counter))
)
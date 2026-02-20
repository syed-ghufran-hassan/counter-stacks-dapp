import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Counter Contract", () => {
  beforeEach(() => {
    // Reset counter before each test
    simnet.callPublicFn(
      "counter",
      "reset",
      [],
      deployer
    );
  });

  describe("Initial State", () => {
    it("should initialize counter to 0", () => {
      const result = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );

      expect(result.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Increment Function", () => {
    it("should increment counter by positive amount", () => {
      const incrementAmount = 5;

      const result = simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(incrementAmount)],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(incrementAmount));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(incrementAmount));
    });

    it("should allow increment by zero", () => {
      const result = simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(0)],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(0));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(0));
    });

    it("should allow multiple increments", () => {
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(3)],
        user1
      );

      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(4)],
        user2
      );

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(7));
    });

    it("should allow increment by large amount", () => {
      const largeAmount = 1000000;

      const result = simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(largeAmount)],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(largeAmount));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(largeAmount));
    });

    it("should allow anyone to increment", () => {
      const result1 = simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(2)],
        user1
      );
      expect(result1.result).toBeOk(Cl.uint(2));

      const result2 = simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(3)],
        user2
      );
      expect(result2.result).toBeOk(Cl.uint(5));
    });
  });

  describe("Decrement Function", () => {
    beforeEach(() => {
      // Set counter to 10
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(10)],
        deployer
      );
    });

    it("should decrement counter by valid amount", () => {
      const decrementAmount = 4;

      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(decrementAmount)],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(6));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(6));
    });

    it("should prevent decrement below zero", () => {
      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(15)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(100)); // err-not-positive

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(10)); // Unchanged
    });

    it("should allow decrement by zero", () => {
      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(0)],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(10));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(10));
    });

    it("should allow multiple decrements", () => {
      simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(3)],
        user1
      );

      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(2)],
        user2
      );

      expect(result.result).toBeOk(Cl.uint(5));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(5));
    });

    it("should allow decrement to zero", () => {
      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(10)],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(0));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(0));
    });

    it("should allow anyone to decrement", () => {
      const result1 = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(3)],
        user1
      );
      expect(result1.result).toBeOk(Cl.uint(7));

      const result2 = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(2)],
        user2
      );
      expect(result2.result).toBeOk(Cl.uint(5));
    });
  });

  describe("Reset Function", () => {
    beforeEach(() => {
      // Set counter to 20
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(20)],
        deployer
      );
    });

    it("should reset counter to zero", () => {
      const result = simnet.callPublicFn(
        "counter",
        "reset",
        [],
        user1
      );

      expect(result.result).toBeOk(Cl.uint(0));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(0));
    });

    it("should allow reset from zero", () => {
      // Reset first time
      simnet.callPublicFn(
        "counter",
        "reset",
        [],
        user1
      );

      // Reset again
      const result = simnet.callPublicFn(
        "counter",
        "reset",
        [],
        user2
      );

      expect(result.result).toBeOk(Cl.uint(0));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(0));
    });

    it("should allow anyone to reset", () => {
      const result1 = simnet.callPublicFn(
        "counter",
        "reset",
        [],
        user1
      );
      expect(result1.result).toBeOk(Cl.uint(0));

      // Increment again
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(5)],
        user1
      );

      const result2 = simnet.callPublicFn(
        "counter",
        "reset",
        [],
        user2
      );
      expect(result2.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Complex Operations", () => {
    it("should handle sequence of operations", () => {
      // Start at 0
      
      // Increment 10
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(10)],
        user1
      );
      
      // Increment 5
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(5)],
        user2
      );
      
      let count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(15));
      
      // Decrement 3
      simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(3)],
        user1
      );
      
      count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(12));
      
      // Decrement 7
      simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(7)],
        user2
      );
      
      count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(5));
      
      // Try to decrement too much
      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(10)],
        user1
      );
      expect(result.result).toBeErr(Cl.uint(100));
      
      count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(5));
      
      // Reset
      simnet.callPublicFn(
        "counter",
        "reset",
        [],
        user1
      );
      
      count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(0));
    });

    it("should handle concurrent operations from multiple users", () => {
      // User1 increments
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(3)],
        user1
      );

      // User2 increments
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(4)],
        user2
      );

      // User1 decrements
      simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(2)],
        user1
      );

      // User2 increments
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(1)],
        user2
      );

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(6)); // 3+4-2+1 = 6
    });
  });

  describe("Edge Cases", () => {
    it("should handle large but safe uint values", () => {
      const safeLargeValue = 9007199254740991; // MAX_SAFE_INTEGER

      const result = simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(safeLargeValue)],
        deployer
      );

      expect(result.result).toBeOk(Cl.uint(safeLargeValue));

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(safeLargeValue));
    });

    it("should handle increment by 1 repeatedly", () => {
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "counter",
          "increment",
          [Cl.uint(1)],
          user1
        );
      }

      const count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(10));
    });

    it("should handle decrement from zero correctly", () => {
      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(1)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(100));
    });

    it("should maintain state between reads", () => {
      // First read
      let count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(0));

      // Increment
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(7)],
        user1
      );

      // Second read
      count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(7));

      // Another increment
      simnet.callPublicFn(
        "counter",
        "increment",
        [Cl.uint(3)],
        user2
      );

      // Final read
      count = simnet.callReadOnlyFn(
        "counter",
        "get-count",
        [],
        deployer
      );
      expect(count.result).toBeOk(Cl.uint(10));
    });
  });

  describe("Error Code", () => {
    it("should return err-not-positive (u100) for invalid decrement", () => {
      const result = simnet.callPublicFn(
        "counter",
        "decrement",
        [Cl.uint(5)],
        user1
      );

      expect(result.result).toBeErr(Cl.uint(100));
    });
  });
});
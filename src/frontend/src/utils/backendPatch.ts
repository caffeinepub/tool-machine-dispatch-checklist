// Runtime stub for _initializeAccessControlWithSecret.
// The auto-generated Backend class does not include this method, but
// useActor.ts (a protected generated file) always calls it after creating
// an actor. We patch the prototype here so the call is a safe no-op when
// the Motoko canister does not expose the method directly.
import { Backend } from "../backend";

const proto = Backend.prototype as unknown as Record<string, unknown>;
if (!proto._initializeAccessControlWithSecret) {
  proto._initializeAccessControlWithSecret = async (
    _secret: string,
  ): Promise<void> => {
    // no-op: the authorization component handles this internally
  };
}

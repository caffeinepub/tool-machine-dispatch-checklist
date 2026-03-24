// Module augmentation to add the access-control initializer declared in
// backend.d.ts but missing from the auto-generated backend.ts source.
// Both the interface and the Backend class are augmented so that TypeScript
// is satisfied throughout the codebase.
import type {} from "../backend";

declare module "../backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
  // Class augmentation: tells TS that Backend instances satisfy the
  // augmented interface without modifying the protected source file.
  interface Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// @testing-library/react's automatic cleanup only self-registers when it
// detects global Jest/Vitest hooks; this project imports test hooks
// explicitly per file (no `test.globals` in vitest.config.ts), so register
// it here to unmount each rendered component between tests.
afterEach(cleanup);

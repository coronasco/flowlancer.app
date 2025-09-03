import { describe, it, expect, beforeEach } from "vitest";
import * as repo from "../../server/modules/projects/repo";
import type { ProjectCreate } from "../../lib/schemas/projects";

describe("projects repo (in-memory fallback)", () => {
    const userId = "user@example.com";

    // Ensure each test starts clean by relying on in-memory fallback (no Supabase envs set)
    beforeEach(() => {
        // no-op; compat uses internal in-memory maps when Supabase envs are missing
    });

    it("creates and lists projects", async () => {
        const p = await repo.createProject(userId, { name: "Test Project", price_type: "hourly" as const, price: 50 });
        expect(p.name).toBe("Test Project");

        const list = await repo.listProjects(userId);
        expect(Array.isArray(list)).toBe(true);
        expect(list.find((x) => x.id === p.id)).toBeTruthy();
    });

    it("rejects invalid project payload", async () => {
        // empty name should throw
        await expect(repo.createProject(userId, { name: "" } as unknown as ProjectCreate)).rejects.toBeTruthy();
    });

    it("task lifecycle: add → list → move → rename → delete", async () => {
        const p = await repo.createProject(userId, { name: "With Tasks", price_type: "hourly" as const, price: 75 });

        const t1 = await repo.addTask(userId, p.id, { title: "First", status: "Backlog" });
        const t2 = await repo.addTask(userId, p.id, { title: "Second", status: "Backlog" });
        expect(t1.title).toBe("First");
        expect(t2.title).toBe("Second");

        const tasks0 = await repo.listTasks(userId, p.id);
        expect(tasks0.map((t) => t.title)).toEqual(["First", "Second"]);

        const moved = await repo.updateTaskStatus(userId, p.id, t1.id, "In Progress");
        expect(moved.status).toBe("In Progress");

        const renamed = await repo.renameTask(userId, p.id, t2.id, "Second (renamed)");
        expect(renamed.title).toBe("Second (renamed)");

        const afterOps = await repo.listTasks(userId, p.id);
        expect(afterOps.some((t) => t.id === t1.id && t.status === "In Progress")).toBe(true);
        expect(afterOps.some((t) => t.id === t2.id && t.title.includes("renamed"))).toBe(true);

        const delOk = await repo.deleteTask(userId, p.id, t2.id);
        expect(delOk).toBe(true);
        const afterDelete = await repo.listTasks(userId, p.id);
        expect(afterDelete.some((t) => t.id === t2.id)).toBe(false);
    });

    it("updates and deletes project", async () => {
        const p = await repo.createProject(userId, { name: "Old", price_type: "fixed" as const, price: 1000 });
        const updated = await repo.updateProject(userId, p.id, { name: "New" });
        expect(updated.name).toBe("New");

        const ok = await repo.deleteProject(userId, p.id);
        expect(ok).toBe(true);
        const list = await repo.listProjects(userId);
        expect(list.some((x) => x.id === p.id)).toBe(false);
    });
});



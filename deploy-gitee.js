const GITEE_TOKEN = process.env.GITEE_TOKEN;
const GITEE_USER = "hzz1111";
const REPO_NAME = "algorithm-kingdom";
const BRANCH = "master";

const API = "https://gitee.com/api/v5";

async function api(method, path, body) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${API}${path}${sep}access_token=${GITEE_TOKEN}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { throw new Error(`${res.status}: ${text.slice(0, 300)}`); }
}

async function deploy() {
    const fs = await import("fs");
    const p = await import("path");

    console.log("1. 检查/创建仓库...");
    let repo;
    try { repo = await api("GET", `/repos/${GITEE_USER}/${REPO_NAME}`); }
    catch { repo = await api("POST", "/user/repos", { name: REPO_NAME, description: "算法王国大冒险", auto_init: true, private: false }); }
    console.log(`   仓库: ${repo.full_name}`);

    console.log("2. 获取远程文件 SHA 映射...");
    const remoteSHA = {};
    try {
        const tree = await api("GET", `/repos/${GITEE_USER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`);
        (tree.tree || []).forEach(i => { if (i.type === "blob") remoteSHA[i.path] = i.sha; });
    } catch {}
    console.log(`   远程 ${Object.keys(remoteSHA).length} 个文件`);

    console.log("3. 收集本地文件...");
    const local = [];
    const exclude = new Set(["node_modules", ".git", ".claude", ".github", "deploy.js", "deploy-gitee.js", "cloudbaserc.json", "dist", "vercel.json", "wrangler.toml", ".wranglerignore", ".nodeignore", ".gitignore", "package-lock.json", "package.json"]);
    const walk = (dir, pref) => {
        for (const e of fs.readdirSync(p.join(dir), { withFileTypes: true })) {
            if (exclude.has(e.name)) continue;
            const rel = pref ? pref + "/" + e.name : e.name;
            e.isDirectory() ? walk(p.join(dir, e.name), rel) : local.push(rel);
        }
    };
    walk(".", "");
    console.log(`   本地 ${local.length} 个文件`);

    console.log("4. 上传文件...");
    const encPath = fp => fp.split("/").map(s => encodeURIComponent(s)).join("/");
    let up = 0, del = 0;

    for (let i = 0; i < local.length; i++) {
        const fp = local[i];
        const abs = p.join(".", fp);
        const content = fs.readFileSync(abs);
        const b64 = content.toString("base64");
        const existingSHA = remoteSHA[fp];
        const body = { message: `Update ${fp}`, content: b64, branch: BRANCH };
        if (existingSHA) body.sha = existingSHA;
        await api("PUT", `/repos/${GITEE_USER}/${REPO_NAME}/contents/${encPath(fp)}`, body);
        delete remoteSHA[fp];
        up++;
        console.log(`   [${i+1}/${local.length}] ${fp}`);
    }

    const orphan = Object.keys(remoteSHA);
    for (const fp of orphan) {
        await api("DELETE", `/repos/${GITEE_USER}/${REPO_NAME}/contents/${encPath(fp)}`, {
            message: `Remove ${fp}`, sha: remoteSHA[fp], branch: BRANCH
        });
        del++;
        console.log(`   deleted ${fp}`);
    }

    if (up === 0 && del === 0) { console.log("   无变化"); return; }
    console.log(`   上传 ${up} 个，删除 ${del} 个`);

    console.log("5. 触发 Pages 构建...");
    try { await api("POST", `/repos/${GITEE_USER}/${REPO_NAME}/pages/builds`); }
    catch (e) { console.log("   请在仓库「服务 → Gitee Pages」手动开启"); }

    console.log(`\n✅ 完成！`);
    console.log(`   https://${GITEE_USER}.gitee.io/${REPO_NAME}/`);
}

deploy().catch(e => { console.error("❌ 失败:", e.message); process.exit(1); });

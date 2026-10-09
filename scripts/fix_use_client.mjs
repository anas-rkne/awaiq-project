import fs from "fs";
const p = "components/home/EgyptSection.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace(/^\uFEFF/, "");
c = c.replace(/^\s*["']?use client["']?\s*[\r\n]*/i, "");
c = "'use client';\n\n" + c;
fs.writeFileSync(p, c, "utf8");
console.log("ok");

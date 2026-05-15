import { Client } from "@gradio/client";
async function run() {
  const c1 = await Client.connect("afondiel/image-colorizer-deoldify").catch(()=>null);
  if (c1) console.dir(await c1.view_api(), { depth: null });
  const c2 = await Client.connect("leonelhs/deoldify").catch(()=>null);
  if (c2) console.dir(await c2.view_api(), { depth: null });
}
run();

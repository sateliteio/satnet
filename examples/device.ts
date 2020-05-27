import { Device } from "../src";
const device = new Device("satnet", "any");

setInterval(() => console.log(device.nodeManager.nodes), 1000);

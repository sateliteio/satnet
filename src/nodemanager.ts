import { Node } from "ataraxia";
import Debug from "debug";
import { Packet } from "./packet";

const debug = Debug("satnet:nodemanager");

export class NodeManager {
  public nodes: Node[];

  constructor() {
    this.nodes = [];
  }

  public addNode(node: Node): Node[] {
    debug("addNode");
    if (this.nodes.indexOf(node) === -1) {
      debug("addNode:pushNode");
      this.nodes.push(node);
    } else {
      debug("addNode:pushNode:ignore:exists");
    }
    return this.nodes;
  }

  public removeNode(node: Node): Node[] {
    if (this.nodes.indexOf(node) === -1) {
      debug("removeNode:pullNode:ignore:notexists");
    } else {
      debug("removeNode:pullNode:ignore:exists");
      delete this.nodes[this.nodes.indexOf(node)];
      return this.nodes;
    }
    return this.nodes;
  }

  public async sendPrivateMessage(
    nodeId: string,
    packet: Packet,
  ): Promise<void> {
    const node: Node | undefined = this.nodes.find(node => node.id === nodeId);
    if (!node) throw new Error("Node Not Found");
    else return await node.send(packet.type, packet.payload);
  }
}

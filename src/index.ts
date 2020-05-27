import "source-map-support/register";
import { Network, AnonymousAuth, Node } from "ataraxia";
import { TCPTransport, TCPPeerMDNSDiscovery } from "ataraxia-tcp";
import { MachineLocalTransport } from "ataraxia-local";
import Debug from "debug";
import { NodeManager } from "./nodemanager";
const debug = Debug("satnet");

export class Device {
  public net: Network;
  public local: MachineLocalTransport;
  public transport: TCPTransport;
  public discovery: TCPPeerMDNSDiscovery;
  public nodeManger: NodeManager;
  public type: "any" | "bridge" | "embedded";

  /**
   * @namespace io.satelite.satnet
   * @name Device
   * @description Device class
   * @param networkName Name of network that device in.
   * @param type `any` is normal dynamic device, `bridge` is static device that bridges network to the outside, `embedded` is branded device static device.
   */
  constructor(networkName: string, type: "any" | "bridge" | "embedded") {
    this.type = type;
    this.nodeManger = new NodeManager();
    this.net = new Network({
      name: networkName,
      authentication: [new AnonymousAuth()],
    });
    this.local = new MachineLocalTransport();
    this.discovery = new TCPPeerMDNSDiscovery();
    this.transport = new TCPTransport({
      discovery: this.discovery,
    });
    try {
      this.bootstrap();
    } catch (error) {
      throw new Error("Bootstrapping error \n" + error);
    }
  }

  private async bootstrap(): Promise<void> {
    this.local.onLeader(() => {
      debug("thisnode:leader");
      this.net.addTransport(this.transport);
    });
    this.net.addTransport(this.local);
    this.net.onNodeAvailable(node => this.onNodeAvailable(node));
    this.net.onNodeUnavailable(node => this.onNodeUnavailable(node));
    await this.net.start();
    debug("started");
  }

  private onNodeAvailable(node: Node): void {
    debug("nodeAvailable", node);
    this.nodeManger.addNode(node);
  }

  private onNodeUnavailable(node: Node): void {
    debug("nodeUnavailable", node);
    this.nodeManger.removeNode(node);
  }
}

export default Device;

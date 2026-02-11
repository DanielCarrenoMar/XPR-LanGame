import { server } from "./app.js";
import { AddressInfo } from "net";
import { initSockets } from "./sockets/index.js";
import os from 'os';

export const io = initSockets(server);

server.listen(process.env.PORT || 8081, () => {
    const address = server.address() as AddressInfo;
    const port = address.port;
    const networkInterfaces = os.networkInterfaces();
    let ip = '127.0.0.1';

    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
            for (const iface of interfaces) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    ip = iface.address;
                    break;
                }
            }
        }
    }
    console.log("Listening on " + "http://localhost:" + port);
    console.log("Network IP: " + ip + ":" + port);
});

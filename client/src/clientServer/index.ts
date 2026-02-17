import { server } from "./app.ts";
import { AddressInfo } from "net";
import os from 'os';

server.listen(8082, () => {
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

    console.log(`Listening on http://localhost:${port}`);
    console.log(`Network IP: ${ip}${port}`);
});

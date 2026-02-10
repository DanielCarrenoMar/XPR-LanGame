import { server } from "./app.ts";
import { AddressInfo } from "net";
import os from 'os';

async function postAddress(baseUrl: string, ip: string, port: number): Promise<void> {
    const url = new URL("/postAddress", baseUrl).toString();
    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ip, port }),
    });
}

async function registerSelf(address: string,port: number): Promise<void> {
    const baseUrl = `http://localhost:8081`;

    try {
        await postAddress(baseUrl, address, port);
    } catch (error) {
        console.error("Failed to POST /postAddress:", error);
    }
}

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
    console.log(`Network IP: ${ip}`);
    
    void registerSelf(ip, port);
});

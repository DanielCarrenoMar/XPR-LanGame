import { server } from "./app.js";
import "#endpoints/postAddress.js";
import "#endpoints/sendReset.js";
import "#endpoints/web.js";
import { AddressInfo } from "net";
import { initSockets } from "./sockets/index.js";

initSockets(server);

server.listen(process.env.PORT || 8081, () => {
    const address = server.address() as AddressInfo;
    const port = address.port;
    console.log("Listening on " + "http://localhost:" + port);
});

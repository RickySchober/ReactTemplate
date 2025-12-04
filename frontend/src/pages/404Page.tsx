import NavBar from "../components/NavBar";
import * as React from "react";
import { useState } from "react";

const NotFoundPage: React.FC = () => {
    const [searchRedirect, setSearchRedirect] = useState<string>("");
    return (
        <div className="min-h-screen w-full bg-[#0f1720] text-white flex flex-col">
            <NavBar
            search={searchRedirect}
            setSearch={setSearchRedirect}
            placeholder="Search for a card..."
            />
            <div className="fixed mt-20 w-full h-full bg-slate-900
                        flex flex-col gap-8 items-center justify-center z-90">
            <p className="font-medium text-6xl">404 Page Not Found</p>
            <p className="font-medium text-2xl">Invalid url, trade, or card ID</p>
        </div>
        </div>
    );

}
export default NotFoundPage;
import * as React from "react";
import { Spinner } from "./Spinner";

export class Busy extends React.Component<{}, {}> {
    render() {
        return <div>
            <Spinner width={60} height={60} />
        </div>;
    }
}
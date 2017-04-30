import * as React from "react";

export class Overlay extends React.Component<{}, {}> {
    render(): JSX.Element {
        return <div className="overlay">
            <div className="overlay-background" />
            <div className="overlay-box overlay-padding centered">
                {this.props.children}
            </div>
        </div>;
    }
}
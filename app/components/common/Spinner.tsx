import * as React from "react";

class Props {
    width?: number;
    height?: number;
}

export class Spinner extends React.Component<Props, {}> {
    render() : JSX.Element {
        const style: React.CSSProperties = {
            width: this.props.width ? this.props.width : 40,
            height: this.props.height ? this.props.height : 40
        };

        return <div className="sk-cube-grid" style={style}>
            <div className="sk-cube sk-cube1"></div>
            <div className="sk-cube sk-cube2"></div>
            <div className="sk-cube sk-cube3"></div>
            <div className="sk-cube sk-cube4"></div>
            <div className="sk-cube sk-cube5"></div>
            <div className="sk-cube sk-cube6"></div>
            <div className="sk-cube sk-cube7"></div>
            <div className="sk-cube sk-cube8"></div>
            <div className="sk-cube sk-cube9"></div>
        </div>;
    }
}
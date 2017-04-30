import * as React from "react";
import * as Storage from "../code/services/DataStorage";

export interface ItemProps {
    item: Storage.Item;
    onLoad?: () => void;
}

export class Item extends React.Component<ItemProps, {}> {
    render() {
        let item = this.props.item;

        let captionElement: JSX.Element | null = null;
        if (item.type === Storage.ItemType.Folder) {
            captionElement = 
                <div 
                    className="caption" 
                    title={item.name}
                >
                    {item.name}
                </div>;
        }
        return <div className="itemPreviewContainer">
            <img 
                ref="previewImage"
                className="itemPreview" 
                src={ item.thumbnail ? item.thumbnail.url : ""}
                onLoad={() => this.onImageLoad()}
            />
            {captionElement}
        </div>;
    }

    private onImageLoad(): void {
        if (this.props.onLoad) {
            this.props.onLoad();
        }
    }
}
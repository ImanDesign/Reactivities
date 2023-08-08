import { Button, Grid, Header, Image } from "semantic-ui-react";
import PhotoWidgetDropzone from "./PhotoWidgetDropzone";
import { useEffect, useState } from "react";
import PhotoWidgetCropper from "./PhotoWidgetCropper";

interface Props {
    uploading: boolean;
    uploadPhoto: (file: Blob) => void;
}

export default function PhotoUploadWidget({uploading, uploadPhoto}: Props) {
    const [files, setFiles] = useState<any>([]);
    const [cropper, setCropper] = useState<Cropper>();

    function onCrop() {
        if(cropper)
            cropper.getCroppedCanvas().toBlob(blob => uploadPhoto(blob!))
    }

    useEffect(() => {
        return () => {
            files.forEach((file: any) => URL.revokeObjectURL(file.preview));
        }
    }, [files])

    return (
        <Grid>
            <Grid.Column width={4}>
                <Header sub color="teal" content='Step 1 - Add photo' />
                <PhotoWidgetDropzone setFiles={setFiles} />
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub color="teal" content='Step 2 - Resize photo' />
                {files && files.length > 0 && (
                    <PhotoWidgetCropper setCropper={setCropper} imagePreview={files[0].preview} />
                )}
            </Grid.Column>
            <Grid.Column width={1} />
            <Grid.Column width={4}>
                <Header sub color="teal" content='Step 3 - Preview & Upload' />
                {files && files.length > 0 && (
                    <>
                        <div className="img-preview" style={{minHeight: 200, overflow: 'hidden'}} />
                        <Button.Group widths={2}>
                            <Button loading={uploading} onClick={onCrop} positive icon='check' />
                            <Button disabled={uploading} onClick={() => setFiles([])} icon='close' />
                        </Button.Group>
                    </>
                )}
            </Grid.Column>
        </Grid>
    )
}
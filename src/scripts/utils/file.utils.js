// file.utils.js

const addFileDropListener = (el, callback) => {

    if (window.FileReader) {
        const cancel = (e) => {
            if (e.preventDefault) e.preventDefault();
            return false;
        };

        const drop = (e) => {
            if (e.preventDefault) e.preventDefault();

            const files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();

                // console.log('FileReader drop', file.name, file.type);
                const isAudio = file.type.indexOf('audio') === 0;
                const isVideo = file.type.indexOf('video') === 0;
                const isImage = file.type.indexOf('image') === 0;

                reader.onloadend = (e) => {
                    // console.log('FileReader reader.onloadend', e);
                    callback(file, e.target.result);
                };

                if (isAudio || isVideo || isImage) reader.readAsArrayBuffer(file);
                else reader.readAsText(file);
            }

            return false;
        };

        el.ondragover = cancel;
        el.ondragenter = cancel;
        el.ondrop = drop;
    }
};

export { addFileDropListener };

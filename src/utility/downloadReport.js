function base64ToBlob(base64, contentType = '') {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: contentType });
}


export function downlodBlobFromResponse(response, reportName = "download") {
    let blob = base64ToBlob(response.data, response.headers["content-type"]);
    if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    }
}

export function downlodBlobFromResponseV2(response, reportName = "download", file = ".png") {
    // Force the content type to be image/png for PNG files to avoid mobile browser issues
    const contentType = file === ".png" ? "image/png" : (response.headers["content-type"] || "");

    let blob = base64ToBlob(response.data.base64, contentType);
    if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportName}${file}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    }
}



// export function downlodBlobFromResponseV2(response, reportName = "download", file = ".png") {
//     let blob;

//     // Check if response data has base64 property (for images)
//     if (response.data && response.data.base64) {
//         blob = base64ToBlob(response.data.base64, response.headers["content-type"]);
//     } else {
//         // For PDF responses, the data is already a binary buffer
//         blob = new Blob([response.data], { type: response.headers["content-type"] || 'application/pdf' });
//     }

//     if (blob) {
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `${reportName}${file}`;
//         document.body.appendChild(a);
//         a.click();
//         URL.revokeObjectURL(url);
//     }
// }


export async function deleteVercel(urls: string[]) {
    for (const url of urls) {
        console.log(url)
        const res = await fetch("/api/upload", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: url,
            }),
        });
        const data = await res.json();
        console.log("data delete", data)
    }

}
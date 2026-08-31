const {
    AttachmentBuilder
} = require("discord.js");

const sharp =
    require("sharp");

const fs =
    require("fs");

const path =
    require("path");

const globalEmbeds =
    require("../../embeds/global");


const TEMP_DIR =
    path.join(
        process.cwd(),
        "temp"
    );


if (!fs.existsSync(TEMP_DIR)) {

    fs.mkdirSync(
        TEMP_DIR,
        {
            recursive: true
        }
    );

}


/*
 * Escape XML
 */

function escapeXml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

}


/*
 * Wrap caption
 */

function wrapText(
    text,
    max
) {

    const words =
        text.split(/\s+/);

    const lines = [];

    let line = "";

    for (const word of words) {

        const test =
            line
                ? `${line} ${word}`
                : word;

        if (
            test.length >
            max
        ) {

            if (line) {
                lines.push(line);
            }

            line =
                word;

        } else {

            line =
                test;

        }

    }

    if (line) {
        lines.push(line);
    }

    /*
     * Maximum 4 lines
     */

    if (
        lines.length >
        4
    ) {

        lines.length = 4;

        lines[3] =
            `${lines[3]}...`;

    }

    return lines;

}


module.exports = {

    name: "caption",

    aliases: [],

    async execute(
        client,
        message,
        args
    ) {

        /*
         * Guild only
         */

        if (!message.guild) {
            return;
        }


        /*
         * Caption
         */

        const caption =
            args
                .join(" ")
                .trim();


        if (!caption) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        message.author,
                        "You need to provide a **caption**."
                    )
                ]
            });

        }


        /*
         * Attachment
         */

        const attachment =
            message.attachments.first();


        if (!attachment) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        message.author,
                        "You need to attach an **image or GIF**."
                    )
                ]
            });

        }


        /*
         * Check image
         */

        const contentType =
            attachment.contentType ||
            "";

        const fileName =
            attachment.name ||
            "";


        const isImage =
            contentType.startsWith(
                "image/"
            ) ||
            /\.(png|jpe?g|webp|gif)$/i.test(
                fileName
            );


        if (!isImage) {

            return message.channel.send({
                embeds: [
                    globalEmbeds.error(
                        message.author,
                        "The attachment must be an **image or GIF**."
                    )
                ]
            });

        }


        let inputPath;
        let outputPath;


        try {

            /*
             * Download
             */

            const response =
                await fetch(
                    attachment.url
                );


            if (!response.ok) {

                throw new Error(
                    `Download failed: ${response.status}`
                );

            }


            const buffer =
                Buffer.from(
                    await response.arrayBuffer()
                );


            inputPath =
                path.join(
                    TEMP_DIR,
                    `${message.id}-input`
                );


            outputPath =
                path.join(
                    TEMP_DIR,
                    `${message.id}-caption.png`
                );


            fs.writeFileSync(
                inputPath,
                buffer
            );


            /*
             * Image information
             */

            const metadata =
                await sharp(
                    inputPath
                ).metadata();


            const width =
                metadata.width ||
                800;


            const height =
                metadata.height ||
                600;


            /*
             * BLEED-STYLE CAPTION
             *
             * Large
             * Extremely bold
             * Tight
             * Rounded
             * Black
             */

            const fontSize =
                Math.max(
                    36,
                    Math.min(
                        92,
                        Math.round(
                            width * 0.105
                        )
                    )
                );


            const paddingX =
                Math.round(
                    width * 0.045
                );


            const paddingY =
                Math.round(
                    fontSize * 0.35
                );


            const lineHeight =
                Math.round(
                    fontSize * 0.92
                );


            /*
             * More characters per line
             * because the reference uses
             * relatively tight text.
             */

            const lines =
                wrapText(
                    caption,
                    Math.max(
                        10,
                        Math.floor(
                            width /
                            (
                                fontSize *
                                0.48
                            )
                        )
                    )
                );


            const captionHeight =
                Math.round(
                    (
                        lines.length *
                        lineHeight
                    ) +
                    (
                        paddingY *
                        2
                    )
                );


            /*
             * Caption text
             */

            const text =
                lines
                    .map(
                        (
                            line,
                            index
                        ) => {

                            const y =
                                paddingY +
                                fontSize -
                                Math.round(
                                    fontSize *
                                    0.08
                                ) +
                                (
                                    index *
                                    lineHeight
                                );


                            return `
                                <text
                                    x="50%"
                                    y="${y}"
                                    text-anchor="middle"
                                    font-family="Arial Rounded MT Bold, Arial Rounded MT, Arial, sans-serif"
                                    font-size="${fontSize}px"
                                    font-weight="950"
                                    letter-spacing="-1.5px"
                                    fill="#000000"
                                >${escapeXml(line)}</text>
                            `;

                        }
                    )
                    .join("");


            /*
             * White caption area
             */

            const svg =
                `
                <svg
                    width="${width}"
                    height="${captionHeight}"
                    viewBox="0 0 ${width} ${captionHeight}"
                    xmlns="http://www.w3.org/2000/svg"
                >

                    <rect
                        x="0"
                        y="0"
                        width="${width}"
                        height="${captionHeight}"
                        fill="#ffffff"
                    />

                    ${text}

                </svg>
                `;


            /*
             * Create final image
             */

            await sharp(
                inputPath
            )
                .extend({
                    top: 0,
                    bottom: captionHeight,
                    left: 0,
                    right: 0,
                    background: {
                        r: 255,
                        g: 255,
                        b: 255,
                        alpha: 1
                    }
                })
                .composite([
                    {
                        input:
                            Buffer.from(
                                svg
                            ),

                        top:
                            height,

                        left:
                            0
                    }
                ])
                .png()
                .toFile(
                    outputPath
                );


            /*
             * Send
             */

            return message.channel.send({

                files: [
                    new AttachmentBuilder(
                        outputPath,
                        {
                            name:
                                "caption.png"
                        }
                    )
                ]

            });


        } catch (error) {

            console.error(
                "[CAPTION] Failed:",
                error
            );


            return message.channel.send({
                embeds: [
                    globalEmbeds.failed(
                        message.author,
                        "Create caption"
                    )
                ]
            });


        } finally {

            /*
             * Cleanup
             */

            setTimeout(
                () => {

                    for (
                        const file of [
                            inputPath,
                            outputPath
                        ]
                    ) {

                        if (
                            file &&
                            fs.existsSync(
                                file
                            )
                        ) {

                            fs.unlink(
                                file,
                                () => {}
                            );

                        }

                    }

                },
                5000
            );

        }

    }

};

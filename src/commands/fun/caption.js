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
 * Caption wrapping
 */

function wrapText(
    text,
    maxCharacters
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
            maxCharacters
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
         * Image / GIF
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


        const contentType =
            attachment.contentType || "";


        const fileName =
            attachment.name || "";


        const isImage =
            contentType.startsWith("image/") ||
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
                    `${message.id}-caption.gif`
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
                    inputPath,
                    {
                        animated: true
                    }
                ).metadata();


            const width =
                metadata.width ||
                800;


            const height =
                metadata.height ||
                600;


            /*
             * BLEED-STYLE TEXT
             *
             * Based directly on the
             * "chilling" reference.
             */

            const fontSize =
                Math.round(
                    width * 0.068
                );


            const actualFontSize =
                Math.max(
                    34,
                    Math.min(
                        82,
                        fontSize
                    )
                );


            /*
             * White bar height
             */

            const paddingTop =
                Math.round(
                    actualFontSize * 0.45
                );


            const paddingBottom =
                Math.round(
                    actualFontSize * 0.45
                );


            const lineHeight =
                Math.round(
                    actualFontSize * 1.08
                );


            /*
             * Match the reference's
             * relatively wide text.
             */

            const maxCharacters =
                Math.max(
                    10,
                    Math.floor(
                        width /
                        (
                            actualFontSize *
                            0.50
                        )
                    )
                );


            const lines =
                wrapText(
                    caption,
                    maxCharacters
                );


            /*
             * Don't let the caption
             * become enormous.
             */

            if (
                lines.length >
                4
            ) {

                lines.length = 4;

                lines[3] =
                    `${lines[3]}...`;

            }


            /*
             * White bar height
             */

            const captionHeight =
                Math.round(
                    paddingTop +
                    (
                        lines.length *
                        lineHeight
                    ) +
                    paddingBottom
                );


            /*
             * Text
             */

            const text =
                lines
                    .map(
                        (
                            line,
                            index
                        ) => {

                            const y =
                                paddingTop +
                                actualFontSize +
                                (
                                    index *
                                    lineHeight
                                );


                            return `
                                <text
                                    x="50%"
                                    y="${y}"
                                    text-anchor="middle"
                                    font-family="Arial, Helvetica, sans-serif"
                                    font-size="${actualFontSize}px"
                                    font-weight="700"
                                    fill="#000000"
                                >${escapeXml(line)}</text>
                            `;

                        }
                    )
                    .join("");


            /*
             * White caption bar
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
             * Add the caption bar
             *
             * The original image stays
             * completely untouched.
             */

            await sharp(
                inputPath,
                {
                    animated: true
                }
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
                .gif({
                    effort: 3
                })
                .toFile(
                    outputPath
                );


            /*
             * Send GIF
             */

            return message.channel.send({

                files: [
                    new AttachmentBuilder(
                        outputPath,
                        {
                            name:
                                "caption.gif"
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
                            fs.existsSync(file)
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

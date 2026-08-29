const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    create() {

        const row1 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId("vc_lock")
                        .setEmoji("<:vc_lock:1543240964779278439>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_unlock")
                        .setEmoji("<:vc_unlock:1543240922941235290>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_hide")
                        .setEmoji("<:vc_hide:1543241001705930843>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_reveal")
                        .setEmoji("<:vc_reveal:1543241065438519306>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_disconnect")
                        .setEmoji("<:vc_disconnect:1543241366321238026>")
                        .setStyle(ButtonStyle.Secondary)

                );


        const row2 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId("vc_start")
                        .setEmoji("<:vc_start:1543241403511996457>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_info")
                        .setEmoji("<:vc_info:1543241450685202452>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_increase")
                        .setEmoji("<:vc_increase:1543241492884365403>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_decrease")
                        .setEmoji("<:vc_decrease:1543241527780835389>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_claim")
                        .setEmoji("<:vc_claim:1543241117779099709>")
                        .setStyle(ButtonStyle.Secondary)

                );


        return [
            row1,
            row2
        ];

    }

};

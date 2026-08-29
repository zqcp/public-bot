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
                        .setCustomId("vc_reject")
                        .setEmoji("<:vc_reject:1537241549304500315>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_kick")
                        .setEmoji("<:vc_kick:1537241600650903654>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_permit")
                        .setEmoji("<:vc_permit:1537242278991630437>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_lock")
                        .setEmoji("<:vc_lock:1537242322285232158>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_unlock")
                        .setEmoji("<:vc_unlock:1537242360935878797>")
                        .setStyle(ButtonStyle.Secondary)

                );


        const row2 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId("vc_transfer")
                        .setEmoji("<:vc_transfer:1537242413045776394>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_claim")
                        .setEmoji("<:vc_claim:1537242443005698118>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_unmute")
                        .setEmoji("<:vc_unmute:1537242487028977674>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_rename")
                        .setEmoji("<:vc_rename:1537242538413531279>")
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId("vc_limit")
                        .setEmoji("<:vc_limit:1537242633741799435>")
                        .setStyle(ButtonStyle.Secondary)

                );


        return [
            row1,
            row2
        ];

    }

};

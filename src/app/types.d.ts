type Field = {
    name: string;
    value: string;
    inline: boolean;
};

type Embed = {
    color: number;
    fields: Field[];
    author?: {
        name?: string;
        url?: string;
        icon_url?: string;
    };
    footer?: {
        text?: string;
    };
    timestamp?: string;
    image?: {
        url: string;
    };
};

type EmbedData = {
    content: string;
    embeds: Embed[];
    username: string;
    avatar_url: string;
    attachments: any[];
};
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
};

type BotSettingsProps = {
    username: string
    avatarUrl: string
    onUsernameChange: (username: string) => void
    onAvatarUrlChange: (url: string) => void
}

type ColorPickerProps = {
    color: number
    onChange: (color: number) => void
    defaultColor?: string
}

type EmbedEditorProps = {
    embed: Embed
    index: number
    onUpdate: <K extends keyof Embed>(key: K, value: Embed[K]) => void
    onRemove: () => void
    calculateEmbedCharCount: (embed: Embed) => number
}

type EmbedFieldsProps = {
    fields: Field[]
    onAddField: () => void
    onUpdateField: (index: number, field: Partial<Field>) => void
    onRemoveField: (index: number) => void
}

type EmbedPreviewProps = {
    embedData: EmbedData
    onLoadFromClipboard: (data: EmbedData) => void
}

type MessageContentProps = {
    content: string
    onChange: (content: string) => void
}

type TimestampPickerProps = {
    timestamp?: string
    onChange: (timestamp: string) => void
}

type WebhookInputProps = {
    webhookUrl: string
    setWebhookUrl: (url: string) => void
    messageId: string
    setMessageId: (id: string) => void
    embedData: EmbedData
}
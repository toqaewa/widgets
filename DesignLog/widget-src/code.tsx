
const { widget } = figma
const { AutoLayout, Text, Input, SVG, usePropertyMenu, useSyncedState, useEffect } = widget;

type Log = {
  id: string,
  author: string,
  description: string,
  link: string,
  date: string,
  type: string,
};

const STATUSES = [
  { name: "in design", value: { r: 0.57, g: 0.77, b: 0.98, a: 1 } },
  { name: "in production", value: { r: 0.57, g: 0.87, b: 0.67, a: 1 } },
  { name: "deprecated", value: { r: 0.98, g: 0.57, b: 0.57, a: 1 } },
  { name: "archived", value: { r: 0.75, g: 0.75, b: 0.75, a: 1 } },
];

function DesignLog() {

  const [title, setTitle] = useSyncedState("title", "");
  const [description, setDescription] = useSyncedState("description", "");
  const [showDescription, setShowDescription] = useSyncedState("showDescription", true);
  const [createdAt, setCreatedAt] = useSyncedState("createdAt", "");
  const [version, setVersion] = useSyncedState("version", "1.0.0");
  const [status, setStatus] = useSyncedState("status", STATUSES[0].name);
  const [statusColor, setStatusColor] = useSyncedState("statusColor", STATUSES[0].value);
  const [link, setLink] = useSyncedState("link", "");
  const [showLink, setShowLink] = useSyncedState("showLink", true)
  const [logs, setLogs] = useSyncedState<Log[]>("logs", []);

  const lastLogDate = logs.length > 0 
  ? new Date(Math.max(...logs.map(log => new Date(log.date).getTime()))).toISOString() 
  : null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(",", " @");
  };

  useEffect(() => {
    if (!createdAt) {
      setCreatedAt(new Date().toISOString());
    }
  });

  // "Кнопка" как AutoLayout с onClick
  const Button = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: string;
  }) => (
    <AutoLayout
      padding={8}
      cornerRadius={4}
      fill={[{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 1 } }]}
      onClick={onClick}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.15, g: 0.55, b: 0.9, a: 1 } }] }}
    >
      <Text fontSize={14} fontWeight="bold" fill={[{ type: "solid", color: { r: 1, g: 1, b: 1, a: 1 } }]}>
        {children}
      </Text>
    </AutoLayout>
  );

  const handleStatusChange = (propertyName: string) => {
    const selectedStatus = STATUSES.find((status) => status.name ===propertyName)?.name;
    if (selectedStatus) {
      setStatus(selectedStatus);
    }
    const selectedColor = STATUSES.find((status) => status.name === propertyName)?.value;
    if (selectedColor) {
      setStatusColor(selectedColor);
    }
  }

  function addLog() {
    const newLog: Log = {
      id: Date.now().toString(),
      author: figma.currentUser?.name || "Unknown",
      description: "",
      link: "",
      date: new Date().toISOString(),
      type: "added",
    };
    setLogs([newLog, ...logs]);
  }

  function updateLog(id: string, field: keyof Log, value: string) {
    setLogs(logs.map(log => log.id === id ? { ...log, [field]: value } : log));
  }

  function removeLog(id: string) {
    setLogs(logs.filter(log => log.id !== id))
  }

  usePropertyMenu(
    [
      {
        itemType: "toggle",
        propertyName: "toggleDescription",
        tooltip: "Показывать описание",
        isToggled: showDescription,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.25V21H6.75L17.81 9.93L14.06 6.18L3 17.25ZM20.71 7.04L16.96 3.29L15.12 5.12L18.87 8.87L20.71 7.04Z" fill="white"/>
        </svg>
        `,
      },
      {
        itemType: "toggle",
        propertyName: "toggleLink",
        tooltip: "Показывать ссылку",
        isToggled: showLink,
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.479 3.53087C19.5519 2.60383 18.2978 2.07799 16.9868 2.0666C15.6758 2.0552 14.4128 2.55918 13.47 3.46997L11.75 5.17997C11.1488 5.78117 10.7727 6.57194 10.6855 7.41299C10.5983 8.25404 10.8052 9.09633 11.27 9.79997M14 11C13.5705 10.4259 13.0226 9.95087 12.3934 9.60705C11.7643 9.26323 11.0685 9.05888 10.3533 9.00766C9.63821 8.95643 8.92041 9.05963 8.24866 9.3102C7.57691 9.56077 6.96689 9.95296 6.46001 10.46L3.46001 13.46C2.54922 14.403 2.04524 15.666 2.05663 16.977C2.06803 18.288 2.59387 19.542 3.52091 20.4691C4.44795 21.3961 5.70202 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82C12.8412 18.2188 13.2173 17.428 13.3045 16.587C13.3917 15.746 13.1848 14.9036 12.72 14.2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
      },
      {
        itemType: "dropdown",
        propertyName: "status",
        tooltip: "Статус",
        options: STATUSES.map((status) => ({
          option: status.name,
          label: status.name,
        })),
        selectedOption: STATUSES.find((status) => 
          status.value.r === statusColor.r &&
          status.value.g === statusColor.g &&
          status.value.b === statusColor.b
        )?.name || STATUSES[0].name,
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "toggleDescription") setShowDescription(!showDescription);
      if (propertyName === "toggleLink") setShowLink(!showLink);
      if (propertyName === "status" && propertyValue) handleStatusChange(propertyValue);
    }
  );


  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'showToast') {
        figma.notify('Hello widget')
      }
      if (msg.type === 'close') {
        figma.closePlugin()
      }
    }
  })

  return (
    <AutoLayout 
      direction="vertical" 
      minWidth={300}
      spacing={8} 
      padding={16}
      cornerRadius={8}
      fill={[{ type: "solid", color: { r: 0.99, g: 0.99, b: 0.99, a: 1 } }]}
      stroke={[{ type: "solid", color: {r: 0.90, g: 0.90, b: 0.90, a: 1} }]}
      >
      <AutoLayout
        direction="horizontal"
        width={"hug-contents"}
        fill={[{ type: "solid", color: statusColor }]}
        padding={4}
        cornerRadius={8}
      >
        <Text>{status}</Text>
      </AutoLayout>
      <Input
        value={title}
        placeholder="Название макета"
        width="fill-parent"
        fontSize={24} 
        fontWeight="bold"
        onTextEditEnd={(e) => setTitle(e.characters)}
      />
      {showDescription && (
        <Input
          value={description}
          placeholder="Описание"
          onTextEditEnd={(e) => setDescription(e.characters)}
          inputBehavior="multiline"
          width="fill-parent"
        />
      )}
      {showLink && (
        <Input
          value={link}
          placeholder="Ссылка на макет"
          onTextEditEnd={(e) => setLink(e.characters)}
          width="fill-parent"
        />
      )}
      <AutoLayout
        direction="horizontal"
        spacing={16}
      >
        <AutoLayout
          direction="vertical"
          spacing={4}
          width={"hug-contents"}
        >
          <Text fontSize={12}>Created</Text>
          <Text>{createdAt ? formatDate(createdAt) : "—"}</Text>
        </AutoLayout>

        <AutoLayout
          direction="vertical"
          spacing={4}
          width={"hug-contents"}
        >
          <Text fontSize={12}>Last Update</Text>
          <Text>{lastLogDate ? formatDate(lastLogDate) : "—"}</Text>
        </AutoLayout>

        <AutoLayout
          direction="vertical"
          spacing={4}
          width={"hug-contents"}
        >
          <Text fontSize={12}>Version</Text>
          <Input
            value={version}
            placeholder="1.0.0"
            onTextEditEnd={(e) => setVersion(e.characters)}
            width="fill-parent"
          />
        </AutoLayout>
      </AutoLayout>
      <Button onClick={addLog}>Добавить лог</Button>

      {logs.map((log) => (
        <AutoLayout key={log.id} direction="vertical" padding={5} stroke="#ddd">
          <Text fontSize={12}>
              {log.author} 
              ({new Date(log.date).toLocaleDateString()})
          </Text>
          <Input 
            value={log.description} 
            placeholder="Описание изменений" 
            onTextEditEnd={(e) => updateLog(log.id, "description", e.characters)}
          />
          <Input 
            value={log.link} 
            placeholder="Ссылка на новый макет" 
            onTextEditEnd={(e) => updateLog(log.id, "link", e.characters)}
          />
          <Text fontSize={12}>
            Тип: {log.type}
          </Text>
          <Button onClick={() => removeLog(log.id)}>Удалить лог</Button>
        </AutoLayout>
      ))}

      {/* <Text
        fontSize={24}
        onClick={
          // Use async callbacks or return a promise to keep the Iframe window
          // opened. Resolving the promise, closing the Iframe window, or calling
          // "figma.closePlugin()" will terminate the code.
          () =>
            new Promise((resolve) => {
              figma.showUI(__html__)
            })
        }
      >
        Open IFrame
      </Text> */}
    </AutoLayout>
  )
}

widget.register(DesignLog)

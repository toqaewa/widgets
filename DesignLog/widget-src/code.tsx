// This widget will open an Iframe window with buttons to show a toast message and close the window.

const { widget } = figma
const { AutoLayout, Text, Input, usePropertyMenu, useSyncedState, useEffect } = widget;

type Log = {
  id: string,
  author: string,
  description: string,
  link: string,
  date: string,
  type: string,
};

function DesignLog() {

  const [title, setTitle] = useSyncedState("title", "");
  const [description, setDescription] = useSyncedState("description", "");
  const [showDescription, setShowDescription] = useSyncedState("showDescription", true);
  const [version, setVersion] = useSyncedState("version", "1.0.0");
  const [status, setStatus] = useSyncedState("status", "backlog");
  const [link, setLink] = useSyncedState("link", "");
  const [logs, setLogs] = useSyncedState<Log[]>("logs", []);

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

  function addLog() {
    const newLog: Log = {
      id: Date.now().toString(),
      author: figma.currentUser?.name || "Unknown",
      description: "",
      link: "",
      date: new Date().toISOString(),
      type: "added",
    };
    setLogs([...logs, newLog]);
  }

  function updateLog(id: string, field: keyof Log, value: string) {
    setLogs(logs.map(log => log.id === id ? { ...log, [field]: value } : log));
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
    ],
    ({ propertyName }) => {
      if (propertyName === "toggleDescription") setShowDescription(!showDescription);
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

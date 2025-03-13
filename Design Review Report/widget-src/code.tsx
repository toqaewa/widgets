const { widget } = figma
const { AutoLayout, Text, Input, SVG, Image, usePropertyMenu, useSyncedState, useEffect } = widget

// статусы ревью сразу с цветами тега
const STATUSES = [
  { name: "APPROVED", textColor: { r: 0.09, g: 0.5, b: 0.24, a: 1 }, fillColor: { r: 0.29, g: 0.87, b: 0.5, a: 1 } },
  { name: "NEEDS SYNC", textColor: { r: 0.63, g: 0.38, b: 0.03, a: 1 }, fillColor: { r: 0.99, g: 0.88, b: 0.28, a: 1 } },
  { name: "NEEDS DESIGN", textColor: { r: 0.49, g: 0.13, b: 0.81, a: 1 }, fillColor: { r: 0.85, g: 0.71, b: 1, a: 1 } },
  { name: "NOT APPROVED", textColor: { r: 0.73, g: 0.11, b: 0.11, a: 1 }, fillColor: { r: 0.99, g: 0.65, b: 0.65, a: 1 } },
]

// окружения
const ENVS = [
  { name: "preprod" },
  { name: "dev" },
  { name: "stage" },
  { name: "prod" },
  { name: "Storybook" },
]

type Issue = {
  id: string,
  summary: string,
  description: string,
  env: string,
  link: string,
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);

  // Проверка на валидность даты
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Месяцы для отображения
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Получаем компоненты даты
  const day = String(date.getDate()).padStart(2, "0"); // DD
  const month = months[date.getMonth()]; // Mon
  const year = date.getFullYear(); // YYYY
  const hours = String(date.getHours()).padStart(2, "0"); // hh
  const minutes = String(date.getMinutes()).padStart(2, "0"); // mm

  // Форматируем дату
  return `${day} ${month} ${year} @ ${hours}:${minutes}`;
};

function Widget() {

  const [subject, setSubject] = useSyncedState("subject", "");
  const [conductedAt, setConductedAt] = useSyncedState("conductedAt", "");
  const [author, setAuthor] = useSyncedState("author", "");
  const [authorAvatar, setAuthorAvatar] = useSyncedState("authorAvatar", "");
  const [status, setStatus] = useSyncedState("status", STATUSES[0].name);
  const [statusTextColor, setStatusTextColor] = useSyncedState("statusTextColor", STATUSES[0].textColor);
  const [statusFillColor, setStatusFillColor] = useSyncedState("statusFillColor", STATUSES[0].fillColor);
  const [env, setEnv] = useSyncedState("env", ENVS[0].name);

  const [issues, setIssues] = useSyncedState<Issue[]>("issues", []);
  const [editingIssueId, setEditingIssueId] = useSyncedState<string | null>("editingIssueId", null);

  useEffect(() => {
    if (!conductedAt) {
      setConductedAt(new Date().toISOString());
    }
  });

  const ChangeLog = ({
    children,
  } : {
    children: string;
  }) => (
    <AutoLayout
      direction="vertical"
      spacing={4}
      width={"hug-contents"}
    >
      <Text fontSize={12}>{children} at</Text>
      <Text>{conductedAt ? formatDate(conductedAt) : "—"}</Text>
    </AutoLayout>
  );

  const handleStatusChange = (propertyName: string) => {
    const selectedStatus = STATUSES.find((status) => status.name ===propertyName)?.name;
    if (selectedStatus) {
      setStatus(selectedStatus);
    }
    const selectedTextColor = STATUSES.find((status) => status.name === propertyName)?.textColor;
    if (selectedTextColor) {
      setStatusTextColor(selectedTextColor);
    }
    const selectedFillColor = STATUSES.find((status) => status.name === propertyName)?.fillColor;
    if (selectedFillColor) {
      setStatusFillColor(selectedFillColor);
    }
  }

  const StatusTag = () => (
    <AutoLayout
      direction="horizontal"
      spacing={4}
      padding={{horizontal: 8, vertical: 2}}
      width={"hug-contents"}
      fill={[{ type: "solid", color: statusFillColor }]}
    >
      <Text fill={[{ type: "solid", color: statusTextColor }]}>{status}</Text>
    </AutoLayout>
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

  usePropertyMenu(
    [
      {
        itemType: "dropdown",
        propertyName: "status",
        tooltip: "Status",
        options: STATUSES.map((status) => ({
          option: status.name,
          label: status.name,
        })),
        selectedOption: STATUSES.find((status) => 
          status.textColor.r === statusTextColor.r &&
          status.textColor.g === statusTextColor.g &&
          status.textColor.b === statusTextColor.b &&
          status.fillColor.r === statusFillColor.r &&
          status.fillColor.g === statusFillColor.g &&
          status.fillColor.b === statusFillColor.b
        )?.name || STATUSES[0].name,
      },
      {
        itemType: "dropdown",
        propertyName: "env",
        tooltip: "Environment",
        options: ENVS.map((env) => ({
          option: env.name,
          label: env.name,
        })),
        selectedOption: env,
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "status" && propertyValue) handleStatusChange(propertyValue);
      if (propertyName === "env" && propertyValue) setEnv(propertyValue);
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      padding={16}
      spacing={16}
      width={"hug-contents"}
    >
      <StatusTag/>
      <Input
        value={subject}
        placeholder="Design Review Subject"
        width={320}
        fontSize={24} 
        fontWeight="bold"
        onTextEditEnd={(e) => setSubject(e.characters)}
      />
      <ChangeLog children="Conducted"/>
      <Text>{env}</Text>
      <Text
        fontSize={24}
        onClick={
          () =>
            new Promise((resolve) => {
              figma.showUI(__html__)
            })
        }
      >
        Open IFrame
      </Text>
    </AutoLayout>
  )
}

widget.register(Widget)

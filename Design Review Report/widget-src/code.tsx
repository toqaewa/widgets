const { widget } = figma
const { AutoLayout, Text, Input, SVG, Image, usePropertyMenu, useSyncedState, useEffect } = widget

// статусы ревью сразу с цветами тега
const STATUSES = [
  { name: "IN PROGRESS", textColor: { r: 0.22, g: 0.25, b: 0.32, a: 1 }, fillColor: { r: 0.61, g: 0.64, b: 0.69, a: 1 } },
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

  const [errorState, setErrorState] = useSyncedState<Record<string, boolean>>("errorState", {});

  useEffect(() => {
    if (!conductedAt) {
      setConductedAt(new Date().toISOString());
    }
    if (!author) {
      setAuthor(figma.currentUser?.name || "Unknown");
    }
    if (!authorAvatar) {
      setAuthorAvatar(figma.currentUser?.photoUrl || "");
    }
  });

  const ChangeLog = () => (
    <AutoLayout
      direction="horizontal"
      spacing={8}
      width={"hug-contents"}
      verticalAlignItems="center"
    >
      {authorAvatar ? (
        <Image src={authorAvatar} width={20} height={20} cornerRadius={99} />
      ) : (
        <AutoLayout width={20} height={20} cornerRadius={99} fill={"#999"}/>
      )}
      <Text fontWeight={"bold"}>{author}</Text>
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
      cornerRadius={99}
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

  function addIssue() {
    const newIssue: Issue = {
      id: Date.now().toString(),
      summary: "",
      description: "",
      env: env,
      link: "",
    };
    setIssues([newIssue, ...issues]);
    setEditingIssueId(newIssue.id);
  }

  function updateIssue(id: string, field: keyof Issue, value: string) {
    setIssues(issues.map(issue => issue.id === id ? { ...issue, [field]: value } : issue));
  }

  function removeIssue(id: string) {
    setIssues(issues.filter(issue => issue.id !== id))
  }

  function startEditingIssue(id: string) {
    setEditingIssueId(id);
  }

  function saveIssue(id: string) {
    const issue = issues.find((issue) => issue.id === id);
    if (!issue) return;
  
    if (issue.summary.trim() === "") {
      // Устанавливаем ошибку для конкретного issue
      setErrorState((prev) => ({ ...prev, [id]: true }));
      return;
    }
  
    setErrorState((prev) => ({ ...prev, [id]: false }));
    setEditingIssueId(null);
  }

  const openLink = (url: string) => {
    return new Promise<void>((resolve) => {
      figma.showUI(__html__, { visible: false });
  
      // Отправляем URL во внешний интерфейс
      figma.ui.postMessage({ type: "open-link", url });
  
      // Ожидаем сообщение от интерфейса о том, что ссылка открыта
      figma.ui.onmessage = (message) => {
        if (message.type === "link-opened") {
          resolve(); // Разрешаем Promise после открытия ссылки
        }
      };
    });
  };

  const LinkButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: string;
  }) => (
    <AutoLayout
      padding={{ top: 2, right: 8, bottom: 2, left: 2 }}
      spacing={4}
      cornerRadius={4}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 0.2 } }] }}
      onClick={onClick}
    >
      <Text fontSize={14}>🔗</Text>
      <Text 
        fontSize={14} 
        fontWeight="bold" 
        fill={[{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 1 } }]}
      >
        {children}
      </Text>
    </AutoLayout>
  );

  const IconButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: string;
  }) => (
    <AutoLayout
      padding={4}
      cornerRadius={4}
      fill={[ ]}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 0.2 } }] }}
      onClick={onClick}
    >
      <Text fontSize={12} fill={"#777"} hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }] }}>
        {children}
      </Text>
    </AutoLayout>
  );

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
      {
        itemType: "action",
        propertyName: "add-issue",
        tooltip: "Add Issue",
        icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "status" && propertyValue) handleStatusChange(propertyValue);
      if (propertyName === "env" && propertyValue) setEnv(propertyValue);
      if (propertyName ==="add-issue") addIssue();
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      padding={16}
      spacing={16}
      cornerRadius={16}
      width={"hug-contents"}
      fill={"#FCFCFC"}
    >
      <AutoLayout
        direction="horizontal"
        verticalAlignItems="center"
        spacing={16}
      >
        <StatusTag/>
        <ChangeLog/>
      </AutoLayout>
      <Input
        value={subject}
        placeholder="Design Review Subject"
        width={320}
        fontSize={24} 
        fontWeight="bold"
        onTextEditEnd={(e) => setSubject(e.characters)}
      />
      {issues.map((issue) => (
        <AutoLayout
          key={issue.id}
          direction="vertical"
          spacing={8}
          padding={12}
          cornerRadius={12}
          width={"hug-contents"}
          fill={"#F2F2F2"}
        >
          {editingIssueId === issue.id ? (
            <>
              <AutoLayout
                direction="horizontal"
                spacing={8}
                width={"hug-contents"}
              >
                <AutoLayout
                  direction="vertical"
                  spacing={8}
                  width={"hug-contents"}
                >
                  <AutoLayout
                    direction="vertical"
                    spacing={8}
                    width={"fill-parent"}
                  >
                    <Input
                      value={issue.summary}
                      placeholder="Issue summary"
                      width={"fill-parent"}
                      fontSize={16} 
                      fontWeight="bold"
                      fill={errorState[issue.id] ? "#FF0000" : "#000000"} // Если ошибка — красный текст
                      onTextEditEnd={(e) => {
                        updateIssue(issue.id, "summary", e.characters);
                        if (e.characters.trim() !== "") {
                          setErrorState((prev) => ({ ...prev, [issue.id]: false })); // Убираем ошибку
                        }
                      }}
                    />
                    <Input
                      value={issue.description}
                      placeholder="Issue description"
                      width={"fill-parent"}
                      fontSize={12} 
                      onTextEditEnd={(e) => updateIssue(issue.id, "description", e.characters)}
                    />
                    <Input
                      value={issue.link}
                      placeholder="Design link"
                      width={"fill-parent"}
                      fontSize={12} 
                      onTextEditEnd={(e) => updateIssue(issue.id, "link", e.characters)}
                    />
                  </AutoLayout>
                  <AutoLayout
                    direction="horizontal"
                    spacing={8}
                    width={"hug-contents"}
                  >
                    <AutoLayout
                      direction="vertical"
                      spacing={8}
                      width={320}
                    >
                      <Text>{env}</Text>
                    </AutoLayout>
                    <AutoLayout
                      direction="vertical"
                      spacing={8}
                      width={320}
                    >
                      <Text>Design</Text>
                    </AutoLayout>
                  </AutoLayout>
                </AutoLayout>
                <IconButton onClick={() => saveIssue(issue.id)}>💾</IconButton>
                <IconButton onClick={() => removeIssue(issue.id)}>🗑️</IconButton>
              </AutoLayout>
            </>
          ) : (
            <>
              <AutoLayout
                direction="horizontal"
                spacing={8}
                width={"hug-contents"}
              >
                <AutoLayout
                  direction="vertical"
                  spacing={8}
                  width={"hug-contents"}
                >
                  <AutoLayout
                    direction="vertical"
                    spacing={8}
                    width={"fill-parent"}
                  >
                    <Text
                      fontSize={16} 
                      fontWeight="bold"
                      width={"fill-parent"}
                    >
                      🤡 {issue.summary}
                    </Text>
                    {issue.description !== "" && (
                      <Text
                        fontSize={12}
                        width={"fill-parent"}
                      >
                        {issue.description}
                      </Text>
                    )}
                    {issue.link !== "" && (
                      <LinkButton onClick={() => openLink(issue.link)}>Link to Design</LinkButton>
                    )}
                  </AutoLayout>
                  <AutoLayout
                    direction="horizontal"
                    spacing={8}
                    width={"hug-contents"}
                  >
                    <AutoLayout
                      direction="vertical"
                      spacing={8}
                      width={320}
                    >
                      <Text>{env}</Text>
                      <Text>MEDIA</Text>
                    </AutoLayout>
                    <AutoLayout
                      direction="vertical"
                      spacing={8}
                      width={320}
                    >
                      <Text>Design</Text>
                      <Text>MEDIA</Text>
                    </AutoLayout>
                  </AutoLayout>
                </AutoLayout>
                <IconButton onClick={() => startEditingIssue(issue.id)}>📝</IconButton>
                <IconButton onClick={() => removeIssue(issue.id)}>🗑️</IconButton>
              </AutoLayout>
            </>
          )}
        </AutoLayout>
      ))}
    </AutoLayout>
  )
}

widget.register(Widget)

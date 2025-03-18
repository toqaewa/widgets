const { widget } = figma
const { useEffect, usePropertyMenu, useSyncedState, Input, AutoLayout, Text } = widget

const STATUSES = [
  { name: "IN DESIGN", textColor: "#49627D", fillColor: "#91C4FA" },
  { name: "IN PRODUCTION", textColor: "#496F56", fillColor: "#91DEAB" },
  { name: "DEPRECATED", textColor: "#7D4949", fillColor: "#FA9191" },
  { name: "ARCHIVED", textColor: "#606060", fillColor: "#BFBFBF" },
]

interface Link {
  id: string;
  text: string;
  URL: string;
}

interface UseCase {
  id: string;
  name: string;
  description: string;
  isWrapped: boolean;
  links: Link[];
}

function Widget() {
  const [componentName, setComponentName] = useSyncedState("componentName", "");

  const [componentLink, setComponentLink] = useSyncedState("componentLink", "");

  const [componentStatus, setComponentStatus] = useSyncedState("status", STATUSES[0].name);
  const [statusTextColor, setStatusTextColor] = useSyncedState("statusTextColor", STATUSES[0].textColor);
  const [statusFillColor, setStatusFillColor] = useSyncedState("statusFillColor", STATUSES[0].fillColor);

  const [useCases, setUseCases] = useSyncedState<UseCase[]>("useCases", []);
  const [editingUseCaseId, setEditingUseCaseId] = useSyncedState<string | null>("editingUseCaseId", null);

  const [errorState, setErrorState] = useSyncedState<Record<string, boolean>>("errorState", {});

  function addUseCase() {
    const newUseCase: UseCase = {
      id: Date.now().toString(),
      name: "",
      description: "",
      isWrapped: false,
      links: [],
    };
    setUseCases([...useCases, newUseCase]);
    setEditingUseCaseId(newUseCase.id);

    const [useCaseLinks, setUseCaseLinks] = useSyncedState<Link[]>("useCaseLinks", []);
    const [editingUseCaseLinkId, setEditingUseCaseLinkId] = useSyncedState<string | null>("editingUseCaseLinkId", null);

    function addUseCaseLink() {
      const newUseCaseLink: Link = {
        id: Date.now().toString(),
        text: "",
        URL: "",
      };
      setUseCaseLinks([newUseCaseLink, ...useCaseLinks]);
      setEditingUseCaseLinkId(newUseCaseLink.id);
    }
    
    function updateUseCaseLink(id: string, field: keyof Link, value: string) {
      setUseCaseLinks(useCaseLinks.map(useCaseLink => useCaseLink.id === id ? { ...useCaseLink, [field]: value } : useCaseLink));
    }

    function removeUseCaseLink(id:string) {
      setUseCaseLinks(useCaseLinks.filter(useCaseLink => useCaseLink.id !== id));
    }

    function startEditingUseCaseLink(id:string) {
      setEditingUseCaseLinkId(id);
    }

    function saveUseCaseLink(id:string) {
      const useCaseLink = useCaseLinks.find((useCaseLink) => useCaseLink.id === id);
      if (!useCaseLink) return;

      if (useCaseLink.URL.trim() === "") {
        setErrorState((prev) => ({ ...prev, [id]: true }));
        return;
      }

      setErrorState((prev) => ({ ...prev, [id]: false }));
      setEditingUseCaseLinkId(null);
    }
  }

  function updateUseCase(id: string, field: keyof UseCase, value: string) {
    setUseCases(useCases.map(useCase => useCase.id === id ? { ...useCase, [field]: value } : useCase));
  }

  function removeUseCase(id: string) {
    setUseCases(useCases.filter(useCase => useCase.id !== id))
  }

  function startEditingUseCase(id: string) {
    setEditingUseCaseId(id);
  }

  function saveUseCase(id: string) {
    const useCase = useCases.find((useCase) => useCase.id === id);
    if (!useCase) return;
  
    if (useCase.name.trim() === "") {
      setErrorState((prev) => ({ ...prev, [id]: true }));
      return;
    }
  
    setErrorState((prev) => ({ ...prev, [id]: false }));
    setEditingUseCaseId(null);
  }

  function handleStatusChange(propertyName: string) {
    const selectedStatus = STATUSES.find((status) => status.name === propertyName);

    if (selectedStatus) {
        setComponentStatus(selectedStatus.name);
        setStatusTextColor(selectedStatus.textColor);
        setStatusFillColor(selectedStatus.fillColor);
    }
  }

  function validateUrl(url: string): boolean {
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
  }

  const IconButton = ({
    onClick,
    children,
    tooltip,
  }: {
    onClick: () => void;
    children: string;
    tooltip?: string;
  }) => (
    <AutoLayout
      padding={4}
      cornerRadius={4}
      fill={[ ]}
      hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.6, b: 1, a: 0.2 } }] }}
      onClick={onClick}
      tooltip={tooltip}
    >
      <Text fontSize={12} fill={"#777"} hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }] }}>
        {children}
      </Text>
    </AutoLayout>
  );

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

  const StatusTag = ({
    fillColor,
    textColor,
    label
  } : {
    fillColor: string;
    textColor: string;
    label: string;
  }) => (
    <AutoLayout
      direction="horizontal"
      spacing={4}
      padding={{horizontal: 8, vertical: 2}}
      cornerRadius={99}
      width={"hug-contents"}
      fill={fillColor}
    >
      <Text fill={textColor}>{label}</Text>
    </AutoLayout>
  );

  usePropertyMenu(
    [
      {
        itemType: "dropdown",
        propertyName: "status",
        tooltip: "Component status",
        options: STATUSES.map((status) => ({
          option: status.name,
          label: status.name,
        })),
        selectedOption: STATUSES.find((status) => 
          status.fillColor === statusFillColor && statusTextColor === statusTextColor
        )?.name || STATUSES[0].name
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "status" && propertyValue)  handleStatusChange(propertyValue);
    }
  )

  return (
    <AutoLayout
      direction="vertical"
      padding={16}
      spacing={16}
      cornerRadius={16}
      width={"hug-contents"}
      minWidth={320}
      fill={"#FCFCFC"}
    >
      <StatusTag
        fillColor={statusFillColor}
        textColor={statusTextColor}
        label={componentStatus}
      />
      <Input
        value={componentName}
        placeholder="Component name"
        width="fill-parent"
        fontSize={24} 
        fontWeight="bold"
        onTextEditEnd={(e) => setComponentName(e.characters)}
      />
      <Input
        value={componentLink}
        placeholder="Component link"
        onTextEditEnd={(e) => setComponentLink(e.characters)}
        inputBehavior="multiline"
        width="fill-parent"
      />
    </AutoLayout>
  )
}

widget.register(Widget)

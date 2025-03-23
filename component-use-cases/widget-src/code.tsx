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

  const [useCaseLinks, setUseCaseLinks] = useSyncedState<Link[]>("useCaseLinks", []);
  const [editingUseCaseLinkId, setEditingUseCaseLinkId] = useSyncedState<string | null>("editingUseCaseLinkId", null);

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
  }

  function updateUseCase(id: string, field: keyof UseCase, value: string) {
    setUseCases(useCases.map(useCase => useCase.id === id ? { ...useCase, [field]: value } : useCase));
  }
  
  const toggleIsWrapped = (id: string) => {
    setUseCases(useCases.map(useCase => (useCase.id === id ? { ...useCase, isWrapped: !useCase.isWrapped } : useCase)));
  };
  
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

  function addUseCaseLink(useCaseId: string) {
    const newUseCaseLink: Link = {
      id: `${useCaseId}-${Date.now().toString()}`,
      text: "",
      URL: "",
    };
    console.log("Adding link:", newUseCaseLink);
    // setUseCases(useCases.map(useCase => 
    //   useCase.id === useCaseId ? { ...useCase, links: [...useCase.links, newUseCaseLink] } : useCase
    // ));
    setUseCases(useCases.map(useCase => {
      if (useCase.id === useCaseId) {
        const updatedUseCase = { ...useCase, links: [...useCase.links, newUseCaseLink] };
        console.log("Updated useCase:", updatedUseCase);
        return updatedUseCase;
      }
      return useCase;
    }));
    setEditingUseCaseLinkId(newUseCaseLink.id);
  }

  function updateUseCaseLink(useCaseId: string, linkId: string, field: keyof Link, value: string) {
    setUseCases(useCases.map(useCase => 
      useCase.id === useCaseId ? { 
        ...useCase, 
        links: useCase.links.map(link => 
          link.id === linkId ? { ...link, [field]: value } : link
        )
      } : useCase
    ));
  }

  function removeUseCaseLink(useCaseId: string, linkId: string) {
    setUseCases(useCases.map(useCase => 
      useCase.id === useCaseId ? { 
        ...useCase, 
        links: useCase.links.filter(link => link.id !== linkId)
      } : useCase
    ));
  }

  function startEditingUseCaseLink(id:string) {
    setEditingUseCaseLinkId(id);
  }

  function saveUseCaseLink(useCaseId: string, linkId: string) {
    setUseCases(useCases.map(useCase => {
      if (useCase.id === useCaseId) {
        // Находим ссылку, которую нужно сохранить
        const updatedLinks = useCase.links.map(link => {
          if (link.id === linkId) {
            // Проверяем, что URL не пустой
            if (link.URL.trim() === "") {
              setErrorState((prev) => ({ ...prev, [linkId]: true }));
              return link; // Возвращаем ссылку без изменений, если URL пустой
            }
            setErrorState((prev) => ({ ...prev, [linkId]: false }));
            return link; // Возвращаем обновленную ссылку
          }
          return link;
        });
  
        // Возвращаем обновленный UseCase
        return { ...useCase, links: updatedLinks };
      }
      return useCase;
    }));
  
    // Сбрасываем редактирование
    setEditingUseCaseLinkId(null);
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

  function openLink(url: string): Promise<void> {
    return new Promise<void>((resolve) => {
      figma.showUI(__html__, { visible: false });
  
      figma.ui.postMessage({ type: "open-link", url });
  
      figma.ui.onmessage = (message) => {
        if (message.type === "link-opened") {
          resolve();
        }
      };
    });
  };

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
      minWidth={20}
      verticalAlignItems={"center"}
      horizontalAlignItems={"center"}
      onClick={onClick}
      tooltip={tooltip}
    >
      <Text 
        verticalAlignText={"center"}
        horizontalAlignText={"center"}
        fontSize={12} 
        fill={"#777"} 
        hoverStyle={{ fill: [{ type: "solid", color: { r: 0.2, g: 0.2, b: 0.2, a: 1 } }] }}
      >
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
      padding={2}
      spacing={2}
      cornerRadius={4}
      hoverStyle={{opacity: 0.8}}
      onClick={onClick}
      maxWidth={320}
    >
      <Text
        fontSize={14}
        fontWeight="bold" 
        fill={"#1C4ED8"}
      >
        ↗︎
      </Text>
      <Text 
        fontSize={14} 
        fontWeight="bold" 
        fill={"#1C4ED8"}
        textDecoration={"underline"}
        truncate={1}
        width={"fill-parent"}
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

  const Checkbox = ({
    onChange,
    checked,
    label,
  } : {
    onChange: () => void;
    checked: boolean;
    label?: string;
  }) => (
    <AutoLayout
      onClick={onChange}
      direction="horizontal" 
      spacing={4} 
      verticalAlignItems={"start"}
      width={"hug-contents"}
      hoverStyle={{opacity: 0.7}}
    >
      <AutoLayout
        width={"hug-contents"}
        height={"hug-contents"}
        padding={2}
      >
        <AutoLayout
          width={16}
          height={16}
          cornerRadius={4}
          stroke="#777"
          fill="#FFF"
          horizontalAlignItems="center"
          verticalAlignItems="center"
        >
          {checked && (
            <Text fill="#777" fontSize={10} fontWeight="bold">
              ✓
            </Text>
          )}
        </AutoLayout>
      </AutoLayout>
      <Text
        fontSize={14}
        fill={"#333"}
        lineHeight={20}
      >
        {label}
      </Text>
    </AutoLayout>
    )

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
      if (propertyName === "status" && propertyValue) handleStatusChange(propertyValue);
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
        width={"fill-parent"}
      />
      <AutoLayout
        direction={"horizontal"}
        spacing={12}
        padding={8}
      >
        <Text width={200}>Use Case</Text>
        <Text width={320}>Usage description</Text>
        <Text width={32} tooltip="Is wrapped?" horizontalAlignText="center">{`</>`}</Text>
        <Text width={320}>Design Links</Text>
      </AutoLayout>
      {useCases.map((useCase) => (
        <AutoLayout
          direction={"horizontal"}
          spacing={12}
          padding={8}
          cornerRadius={8}
          fill={"#F5F5F5"}
        >
          <Input
            value={useCase.name}
            onTextEditEnd={(e) => updateUseCase(useCase.id, "name", e.characters)}
            placeholder="Use Case"
            width={200}
          />
          <Input
            value={useCase.description}
            onTextEditEnd={(e) => updateUseCase(useCase.id, "description", e.characters)}
            placeholder="Usage description"
            width={320}
            inputBehavior={"multiline"}
          />
          <AutoLayout
            width={32}
            horizontalAlignItems={"center"}
          >
            <Checkbox
              onChange={() => toggleIsWrapped(useCase.id)}
              checked={useCase.isWrapped}
              // label="isWrapped"
            />
          </AutoLayout>
          <AutoLayout
            direction="vertical"
            spacing={8}
            width={320}
          >
            {useCase.links.map((link) => (
              <AutoLayout
                key={link.id}
                direction="vertical"
                spacing={8}
                width={"fill-parent"}
              >
                {editingUseCaseLinkId === link.id ? (
                  <>
                    <AutoLayout
                      direction="horizontal"
                      verticalAlignItems="center"
                      spacing={0}
                      width={"fill-parent"}
                    >
                      <Input
                        value={link.text} 
                        placeholder="Link text"
                        onTextEditEnd={(e) => updateUseCaseLink(useCase.id, link.id, "text", e.characters)}
                        width={"fill-parent"}
                      />
                      <Input
                        value={link.URL} 
                        placeholder="URL"
                        onTextEditEnd={(e) => updateUseCaseLink(useCase.id, link.id, "URL", e.characters)}
                        width={"fill-parent"}
                      />
                      <IconButton onClick={() => saveUseCaseLink(useCase.id, link.id)}>✓</IconButton>
                      <IconButton onClick={() => removeUseCaseLink(useCase.id, link.id)}>×</IconButton>
                    </AutoLayout>
                  </>
                ) : (
                  <>
                    <AutoLayout
                      direction="horizontal"
                      verticalAlignItems="center"
                      spacing={0}
                      width={"fill-parent"}
                    >
                      <LinkButton onClick={() => openLink(link.URL)}>{link.text}</LinkButton>
                      <IconButton onClick={() => removeUseCaseLink(useCase.id, link.id)}>×</IconButton>
                    </AutoLayout>
                  </>
                )}
              </AutoLayout>
              ))}
            <IconButton onClick={() => addUseCaseLink(useCase.id)}>+ Add link</IconButton>
          </AutoLayout>
          <IconButton onClick={() => removeUseCase(useCase.id)}>🗑️</IconButton>
        </AutoLayout>
      ))}
      <IconButton onClick={() => addUseCase()}>+ Add use case</IconButton>
    </AutoLayout>
  )
}

widget.register(Widget)

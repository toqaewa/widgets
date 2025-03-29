const { widget } = figma
const { useEffect, usePropertyMenu, useSyncedState, Input, AutoLayout, Text, SVG } = widget

const STATUSES = [
  { name: "IN DESIGN", textColor: "#5C497D", fillColor: "#A891FA" },
  { name: "IN DEVELOPMENT", textColor: "#49627D", fillColor: "#91C4FA" },
  { name: "IN PRODUCTION", textColor: "#496F56", fillColor: "#91DEAB" },
  { name: "DEPRECATED", textColor: "#7D4949", fillColor: "#FA9191" },
  { name: "ARCHIVED", textColor: "#606060", fillColor: "#BFBFBF" },
]

const GROUPS = [
  { name: "---", value: "" },
  { name: "DESIGN TOKENS", value: "🧬 Design Tokens" },
  { name: "PICTOGRAMS", value: "🖼️ Pictograms" },
  { name: "LAYOUT", value: "🧩 Layout" },
  { name: "DATA ENTRY", value: "🚪 Data Entry" },
  { name: "DATA DISPLAY", value: "📺 Data Display" },
  { name: "FEEDBACK", value: "💬 Feedback" },
  { name: "NAVIGATION", value: "🧭 Navigation" },
  { name: "DATA VIZ", value: "📈 Data Viz" },
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

  const [componentGroup, setComponentGroup] = useSyncedState("group", GROUPS[0].value);

  const [componentLink, setComponentLink] = useSyncedState<Link | null>("componentLink", null);
  const [editingComponentLink, setEditingComponentLink] = useSyncedState("editingComponentLink",false);

  const [componentStatus, setComponentStatus] = useSyncedState("status", STATUSES[0].name);
  const [statusTextColor, setStatusTextColor] = useSyncedState("statusTextColor", STATUSES[0].textColor);
  const [statusFillColor, setStatusFillColor] = useSyncedState("statusFillColor", STATUSES[0].fillColor);

  const [useCases, setUseCases] = useSyncedState<UseCase[]>("useCases", []);

  const [errorState, setErrorState] = useSyncedState<Record<string, boolean>>("errorState", {});

  const [editingUseCaseLinkId, setEditingUseCaseLinkId] = useSyncedState<string | null>("editingUseCaseLinkId", null);

  const addComponentLink = () => {
    setComponentLink({
      id: "component-" + Date.now(),
      text: "",
      URL: ""
    });
    setEditingComponentLink(true);
  };

  const updateComponentLink = (field: keyof Link, value: string) => {
    componentLink && setComponentLink({ ...componentLink, [field]: value });
  };

  function addUseCase() {
    const newUseCase: UseCase = {
      id: Date.now().toString(),
      name: "",
      description: "",
      isWrapped: false,
      links: [],
    };
    setUseCases([...useCases, newUseCase]);
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

  function saveUseCaseLink(useCaseId: string, linkId: string) {
    setUseCases(useCases.map(useCase => {
      if (useCase.id === useCaseId) {
        const updatedLinks = useCase.links.map(link => {
          if (link.id === linkId) {
            const isValidUrl = link.URL.trim() !== "" && validateUrl(link.URL);
            setErrorState((prev) => ({ ...prev, [linkId]: !isValidUrl }));
            if (!isValidUrl) {
              return link;
            }
            return link;
          }
          return link;
        });
        return { ...useCase, links: updatedLinks };
      }
      return useCase;
    }));
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

  function handleGroupChange(propertyName: string) {
    const selectedGroup = GROUPS.find((group) => group.name === propertyName);

    if (selectedGroup) {
        setComponentGroup(selectedGroup.value);
    }
  }

  function validateUrl(url: string): boolean {
    const pattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return pattern.test(url);
  }

  function openLink(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!validateUrl(url)) {
        figma.notify("Invalid URL. Example: https://example.com", {
          error: true,
          timeout: 5000,
        });
        reject("Invalid URL");
        return;
      }
  
      figma.showUI(__html__, { visible: false });
      figma.ui.postMessage({ type: "open-link", url });
  
      figma.ui.onmessage = (message) => {
        if (message.type === "link-opened") {
          resolve();
        }
      };
    });
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
  } : {
    onClick: () => Promise<void>;
    children: string;
  }) => {
  
    return (
      <AutoLayout
        padding={2}
        spacing={2}
        cornerRadius={4}
        hoverStyle={{ opacity: 0.8 }}
        onClick={async () => {
          try {
            await onClick();
          } catch (err) {
            console.error("Failed to open link:", err);
          }
        }}
        maxWidth={320}
      >
        <Text fontSize={14} fontWeight="bold" fill={"#1C4ED8"}>↗︎</Text>
        <Text 
          fontSize={14} 
          fontWeight="bold" 
          fill={"#1C4ED8"}
          textDecoration={"underline"}
          truncate={1}
          width={"fill-parent"}
        >
          {children != "" ? children : "Design Link"}
        </Text>
      </AutoLayout>
    );
  };

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

  const ComponentGroup = ({
    group,
  } : {
    group: string;
  }) => (
    <AutoLayout
      direction="horizontal"
      spacing={4}
      padding={0}
      width={"hug-contents"}
    >
      <Text fontSize={20} fill={"#777"}>{group} /</Text>
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

    const FolderIcon = () => (
      <SVG
        src={`
          <svg width="800" height="490" viewBox="0 0 800 490" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M792.719 119.336C792.683 119.287 792.662 119.235 792.621 119.185L705.728 11.0029C704.752 9.78919 703.649 8.74337 702.475 7.80838C698.735 3.37235 693.203 0.49292 686.949 0.49292H113.051C106.792 0.49292 101.27 3.36889 97.5285 7.80838C96.3546 8.74337 95.2499 9.7788 94.2647 11.0029L7.38299 119.185C7.34317 119.235 7.32412 119.287 7.2843 119.336C2.86558 123.078 0 128.592 0 134.831V469.126C0 480.38 9.12485 489.507 20.3794 489.507H779.622C790.877 489.507 800.002 480.38 800.002 469.126V134.831C800.003 128.592 797.136 123.078 792.719 119.336ZM707.333 78.0819L736.549 114.451H707.333V78.0819ZM666.573 41.2535V114.45H513.97C509.617 114.45 505.39 115.843 501.886 118.42L400.011 193.391L298.116 118.41C294.613 115.843 290.383 114.45 286.034 114.45H133.429V41.2535H666.573ZM92.6735 114.451H63.4584L92.6735 78.0819V114.451ZM759.246 448.746H40.7588V155.21H279.349L387.931 235.114C395.116 240.388 404.908 240.399 412.092 235.105L520.651 155.208H759.246V448.746Z" fill="#777"/>
          </svg>
        `}
        width={80}
        height={49}
        opacity={0.5}
      />
    );

    const EmptyState = () => (
      <AutoLayout
        direction="vertical"
        spacing={16}
        padding={24}
        cornerRadius={8}
        fill={"#F5F5F5"}
        width={"fill-parent"}
        horizontalAlignItems="center"
      >
        <FolderIcon/>
        <Text fontSize={14} fill="#777" horizontalAlignText={"center"}>
          No use cases yet. Click below to add your first use case.
        </Text>
        <IconButton onClick={addUseCase}>+ Add First Use Case</IconButton>
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
      {
        itemType: "dropdown",
        propertyName: "group",
        tooltip: "Component Group",
        options: GROUPS.map((group) => ({
          option: group.name,
          label: group.name,
        })),
        selectedOption: GROUPS.find((group) =>
          group.value === componentGroup
        )?.name || GROUPS[0].name
      },
    ],
    ({ propertyName, propertyValue }) => {
      if (propertyName === "status" && propertyValue) handleStatusChange(propertyValue);
      if (propertyName === "group" && propertyValue) handleGroupChange(propertyValue);
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
      <AutoLayout
        direction={"horizontal"}
        spacing={4}
        padding={0}
        verticalAlignItems={"center"}
        width={"fill-parent"}
      >
        {componentGroup !== "" && <ComponentGroup group={componentGroup}/>}
        <Input
          value={componentName}
          placeholder="Component name"
          width={"fill-parent"}
          fontSize={20} 
          fontWeight={"bold"}
          onTextEditEnd={(e) => setComponentName(e.characters)}
        />
      </AutoLayout>
      {!componentLink ? (
        <IconButton onClick={addComponentLink}>+ Add Component Link</IconButton>
      ) : (
        <AutoLayout direction="horizontal" spacing={0} verticalAlignItems="center">
          {editingComponentLink ? (
            <>
              <Input
                value={componentLink.text}
                placeholder="Link text"
                onTextEditEnd={(e) => updateComponentLink("text", e.characters)}
                width={200}
              />
              <Input
                value={componentLink?.URL || ""}
                placeholder="URL"
                onTextEditEnd={(e) => updateComponentLink("URL", e.characters)}
                width={200}
              />
              <IconButton onClick={() => setEditingComponentLink(false)}>
                ✓
              </IconButton>
            </>
          ) : (
            <>
              <LinkButton onClick={() => openLink(componentLink.URL)}>
                {componentLink.text || "Component Link"}
              </LinkButton>
            </>
          )}
          <IconButton onClick={() => setComponentLink(null)}>×</IconButton>
        </AutoLayout>
      )}
      <AutoLayout
        direction={"horizontal"}
        spacing={12}
        padding={8}
      >
        <Text width={200} fill={"#777"}>Use Case</Text>
        <Text width={320} fill={"#777"}>Usage description</Text>
        <Text width={32} fill={"#777"} tooltip="Is wrapped?" horizontalAlignText="center">{`</>`}</Text>
        <Text width={320} fill={"#777"}>Design Links</Text>
      </AutoLayout>
      {useCases.length === 0 ? (
        <EmptyState/>
      ) : (
        useCases.map((useCase) => (
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
        ))
      )}
      {useCases.length !== 0 &&
        <IconButton onClick={() => addUseCase()}>+ Add use case</IconButton>
      }
      {/* <IconButton onClick={() => addUseCase()}>+ Add use case</IconButton> */}
    </AutoLayout>
  )
}

widget.register(Widget)

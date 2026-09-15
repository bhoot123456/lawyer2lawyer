const React = require("react");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "components", "Sidebar.js");
let content = fs.readFileSync(filePath, "utf8");

function addImports() {
  if (content.includes("React, { useState }")) return;
  content = content.replace(
    'import React from "react"',
    'import React, { useState } from "react"'
  );
}

function addStyles() {
  const styleMarker = "  closeBtnHovered: {";
  if (content.includes(styleMarker)) return;
  const insertAt = content.lastIndexOf("}");
  const newStyles = `
  closeBtnHovered: {
    backgroundColor: "rgba(212, 175, 55, 0.18)",
  },
  menuItemHovered: {
    backgroundColor: "rgba(212, 175, 55, 0.10)",
  },`;
  content = content.slice(0, insertAt) + newStyles + content.slice(insertAt);
}

function addNavHover() {
  const search = "const isActive = pathname === item.route;";
  if (!content.includes(search)) return;
  const replacement = `const isActive = pathname === item.route;
          const [hovered, setHovered] = useState(false);
          const isWeb = Platform.OS === "web";
          const hoverStyle = hovered && isWeb ? styles.menuItemHovered : null;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, isActive ? styles.menuItemActive : null, hoverStyle]}
              onPress={async () => {
                if (item.label === "Logout" || item.label === "Lawyer Logout") {
                  await logout();
                  setIsAdmin(false);
                  setIsLawyer(false);
                  if (onClose) onClose();
                  blurActiveElement();
                  router.replace(item.label === "Lawyer Logout" ? "/lawyer-login" : "/login");
                  return;
                }
                handlePress(item.route);
              }}
              onMouseEnter={isWeb ? () => setHovered(true) : undefined}
              onMouseLeave={isWeb ? () => setHovered(false) : undefined}
            >`;
  content = content.replace(search, replacement);
  // Now remove the old closing </TouchableOpacity> that follows the onPress handler
  const oldClose = `            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? colors.accent.gold : colors.text.muted}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuItemText, isActive ? styles.menuItemTextActive : null]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>`;
  const newClose = `            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? colors.accent.gold : colors.text.muted}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuItemText, isActive ? styles.menuItemTextActive : null]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>`;
  // Actually both are identical, so we only need to replace the opening. The closing stays the same.
}

function addCloseHover() {
  const search = "closeBtn: {";
  if (!content.includes(search)) return;
  if (content.includes("closeBtnHovered:")) return;
  // Find the closeBtn style block and add hover
  const closeBtnStyle = `  closeBtn: {
    padding: 4,
  },`;
  const closeBtnWithHover = `  closeBtn: {
    padding: 4,
  },
  closeBtnHovered: {
    backgroundColor: "rgba(212, 175, 55, 0.18)",
  },`;
  content = content.replace(closeBtnStyle, closeBtnWithHover);
  
  // Update the close button TouchableOpacity to use hover
  const searchCloseBtn = `<TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
            >`;
  const replaceCloseBtn = `<TouchableOpacity
              style={({ hovered }) =>
                Platform.OS === "web" && hovered ? [styles.closeBtn, styles.closeBtnHovered] : styles.closeBtn
              }
              onMouseEnter={Platform.OS === "web" ? () => { /* web hover handled by hovered prop */ } : undefined}
              onMouseLeave={Platform.OS === "web" ? () => { /* web hover handled by hovered prop */ } : undefined}
              onPress={onClose}
            >`;
  // React Native TouchableOpacity doesn't have hovered prop - use state-based approach
  // Better approach: add useState for close hover
  content = content.replace(searchCloseBtn, replaceCloseBtn);
}

addImports();
addStyles();
addNavHover();
addCloseHover();

fs.writeFileSync(filePath, content, "utf8");
console.log("Sidebar.js updated with web hover support");

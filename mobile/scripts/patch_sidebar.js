const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "components", "Sidebar.js");
let content = fs.readFileSync(filePath, "utf8");

// 1. Add useState to imports
content = content.replace(
  'import React from "react"',
  'import React, { useState } from "react"'
);

// 2. Add hover styles before the closing }
const hoverStyles = `
  menuItemHovered: {
    backgroundColor: "rgba(212, 175, 55, 0.10)",
  },
  closeBtnHovered: {
    backgroundColor: "rgba(212, 175, 55, 0.18)",
  },`;

const lastBraceIdx = content.lastIndexOf("}");
content = content.slice(0, lastBraceIdx) + hoverStyles + content.slice(lastBraceIdx);

// 3. Add hover state + web hover to nav items
const navSearch = `const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, isActive ? styles.menuItemActive : null]}
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
            >`;

const navReplace = `const isActive = pathname === item.route;
          const [navHovered, setNavHovered] = useState(false);
          const isWeb = Platform.OS === "web";
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, isActive ? styles.menuItemActive : null, navHovered && isWeb ? styles.menuItemHovered : null]}
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
              onMouseEnter={isWeb ? () => setNavHovered(true) : undefined}
              onMouseLeave={isWeb ? () => setNavHovered(false) : undefined}
            >`;

content = content.replace(navSearch, navReplace);

// 4. Add hover state + web hover to close button (add useState before return)
const closeSearch = `return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Lawyer2Lawyer</Text>
        {onClose and (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>`;

const closeReplace = `const [closeHovered, setCloseHovered] = useState(false);
    const isWeb = Platform.OS === "web";
    return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>Lawyer2Lawyer</Text>
        {onClose and (
          <TouchableOpacity
            style={closeHovered && isWeb ? [styles.closeBtn, styles.closeBtnHovered] : styles.closeBtn}
            onPress={onClose}
            onMouseEnter={isWeb ? () => setCloseHovered(true) : undefined}
            onMouseLeave={isWeb ? () => setCloseHovered(false) : undefined}
          >
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>`;

content = content.replace(closeSearch, closeReplace);

fs.writeFileSync(filePath, content, "utf8");
console.log("Sidebar.js updated successfully");

const fs = require('fs');
const path = require('path');

// 1. Fix backend routes
function fixRoutes() {
    const routeFiles = ['Restaurant', 'Table', 'Category', 'MenuItem', 'Payment'];
    routeFiles.forEach(model => {
        let lowerModel = model.charAt(0).toLowerCase() + model.slice(1);
        const filePath = path.join(__dirname, \`src/routes/\${lowerModel}Routes.js\`);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Change .post(protect, ... to .post(protect, admin, ...
            content = content.replace(/\.post\(protect, upload/g, '.post(protect, admin, upload');
            content = content.replace(/\.post\(protect, controller/g, '.post(protect, admin, controller');
            // Change .put(protect, ... to .put(protect, admin, ...
            content = content.replace(/\.put\(protect, upload/g, '.put(protect, admin, upload');
            content = content.replace(/\.put\(protect, controller/g, '.put(protect, admin, controller');
            fs.writeFileSync(filePath, content);
        }
    });
}
fixRoutes();

// 2. Fix Frontend Restaurants.jsx
const restFile = path.join(__dirname, 'frontend/src/pages/Restaurants.jsx');
if (fs.existsSync(restFile)) {
    let content = fs.readFileSync(restFile, 'utf8');
    
    // Add useContext imports
    if(!content.includes('AuthContext')) {
        content = content.replace(
            "import { useState, useEffect } from 'react';", 
            "import { useState, useEffect, useContext } from 'react';\nimport { AuthContext } from '../context/AuthContext';"
        );
    }
    
    // Extract user from AuthContext
    if(!content.includes('const { user }')) {
        content = content.replace(
            "const [loading, setLoading] = useState(true);", 
            "const [loading, setLoading] = useState(true);\n    const { user } = useContext(AuthContext);"
        );
    }
    
    // Hide Add New button
    const btnRegex = /<button[\s\n]*onClick=\{\(\) => setIsModalOpen\(true\)\}[\s\S]*?Add New[\s\S]*?<\/button>/;
    const match = content.match(btnRegex);
    if(match && !content.includes('{user?.role === \'admin\' && (')) {
        content = content.replace(btnRegex, \`{user?.role === 'admin' && (
                \${match[0]}
                )}\`);
    }

    // Hide Edit/Delete icons
    const actionBtns = /<div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">[\s\S]*?<\/div>/;
    const actionMatch = content.match(actionBtns);
    if(actionMatch && !content.includes('{user?.role === \'admin\' && <div className="flex justify-end gap-2')) {
        content = content.replace(actionBtns, \`{user?.role === 'admin' && (
                            \${actionMatch[0]}
                            )}\`);
    }

    fs.writeFileSync(restFile, content);
}
console.log('Authorization patch applied successfully!');

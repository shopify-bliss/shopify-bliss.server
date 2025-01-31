import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import regitration from "./controller/auth/registration.js";
import verify from "./controller/auth/verifyEmail.js";
import login from "./controller/auth/login.js";
import typeTemplate from "./controller/type/type_templates.js";
import brand from "./controller/brand/brand.js";
import section from "./controller/section/section.js";
import navbarFeature from "./controller/navbar_feature/navbar_feature.js";
import navbarLayout from "./controller/navbar_layout/navbar_layout.js";
import menu from "./controller/menu/menu.js";
import subMenu from "./controller/menu/sub_menu.js";
import user from "./controller/user/user.js";
import access from "./controller/access/access.js";
import role from "./controller/auth/role.js";
import superAdmin from "./controller/super_admin/super_admin.js";
import color from "./controller/color/color.js";
import colorDesign from "./controller/color/color_design.js";
import font from "./controller/font/font.js";
import fontDesign from "./controller/font/font_design.js";
import AiBuilder from "./controller/ai_builder/ai_builder.js";
import AiBuilderSection from "./controller/ai_builder/ai_builder_section.js";
import AiBuilderSupport from "./controller/ai_builder/ai_builder_support.js";

import configureMiddleware from "./config/middleware.js";
import "./helper/cronJob.js";

dotenv.config();

const port = 3000;
const app = express();
configureMiddleware(app);
app.use(cookieParser());

app.use(express.json());

app.use(regitration);
app.use(verify);
app.use(login);
app.use(typeTemplate);
app.use(brand);
app.use(section);
app.use(navbarFeature);
app.use(navbarLayout);
app.use(menu);
app.use(subMenu);
app.use(user);
app.use(access);
app.use(role);
app.use(superAdmin);
app.use(color);
app.use(colorDesign);
app.use(font);
app.use(fontDesign);
app.use(AiBuilder);
app.use(AiBuilderSection);
app.use(AiBuilderSupport);

app.listen(port, () => {
  console.log(`running server on port ${port}`);
});

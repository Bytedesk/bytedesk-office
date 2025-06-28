# 微语-AI编辑器

支持通过对话的方式实现 docx/excel/ppt 等文件的编辑。

## 代码库指南

如果您想要添加新功能，我们[强烈推荐阅读](https://github.com/Bytedesk/bytedesk-editor-private/blob/main/VOID_CODEBASE_GUIDE.md)这个关于微语源代码的指南。

如果您阅读了这个指南，这个代码库并不像最初看起来那么复杂！

微语的大部分代码位于 `src/vs/workbench/contrib/void/` 文件夹中。

## 构建微语

### a. Mac - 构建前置条件

如果您使用Mac，您需要Python和XCode。您可能已经默认安装了这些。

### b. Windows - 构建前置条件

如果您使用Windows电脑，首先获取[Visual Studio 2022](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=Community)（推荐）或[VS Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools)（不推荐）。如果您两个都有，您可能需要在两个上都运行接下来的几个步骤。

转到"工作负载"选项卡并选择：

- `使用C++的桌面开发`
- `Node.js构建工具`

转到"单个组件"选项卡并选择：

- `MSVC v143 - VS 2022 C++ x64/x86 Spectre缓解库（最新）`
- `用于最新构建工具的C++ ATL与Spectre缓解`
- `用于最新构建工具的C++ MFC与Spectre缓解`

最后，点击安装。

### c. Linux - 构建前置条件

首先，运行 `npm install -g node-gyp`。然后：

- Debian（Ubuntu等）：`sudo apt-get install build-essential g++ libx11-dev libxkbfile-dev libsecret-1-dev libkrb5-dev python-is-python3`。
- Red Hat（Fedora等）：`sudo dnf install @development-tools gcc gcc-c++ make libsecret-devel krb5-devel libX11-devel libxkbfile-devel`。
- 其他：参见[如何贡献](https://github.com/microsoft/vscode/wiki/How-to-Contribute)。

### d. 在VSCode内构建微语

1. `git clone https://github.com/Bytedesk/bytedesk-editor` 克隆代码库。
2. `npm install` 安装所有依赖项。
3. 要构建微语，打开VSCode。然后：
   - Windows：按 `Ctrl+Shift+B`。
   - Mac：按 `Cmd+Shift+B`。
   - Linux：按 `Ctrl+Shift+B`。
   - 这一步可能需要约5分钟。当您看到两个对勾标记时构建完成（其中一个项目将继续无限旋转 - 它编译我们的React代码）。
4. 要运行微语：
   - Windows：`./scripts/code.bat`。
   - Mac：`./scripts/code.sh`。
   - Linux：`./scripts/code.sh`。
5. 有用提示：
   - 您可以随时在新窗口中按 `Ctrl+R`（`Cmd+R`）重新加载并查看您的新更改。这比 `Ctrl+Shift+P` 和`重新加载窗口`更快。
   - 您可能想要向上述运行命令添加标志 `--user-data-dir ./.tmp/user-data --extensions-dir ./.tmp/extensions`，这让您可以删除`.tmp`文件夹来重置测试时所做的任何IDE更改。
   - 您可以通过在VSCode终端中按 `Ctrl+D` 来终止任何构建脚本。如果您按 `Ctrl+C`，脚本将关闭但继续在后台运行（要打开所有后台脚本，只需重新构建）。

如果您遇到任何错误，请向下滚动查看常见修复方法。

#### 从终端构建微语

要从终端而不是从VSCode内部构建微语，请按照上述步骤，但不要按 `Cmd+Shift+B`，而是运行 `npm run watch`。当您看到类似这样的内容时构建完成：

```shell
[watch-extensions] [00:37:39] Finished compilation extensions with 0 errors after 19303 ms
[watch-client    ] [00:38:06] Finished compilation with 0 errors after 46248 ms
[watch-client    ] [00:38:07] Starting compilation...
[watch-client    ] [00:38:07] Finished compilation with 0 errors after 5 ms
```

#### 常见修复方法

- 确保您遵循了上述前置条件步骤。
- 确保您有Node版本 `20.18.2`（`.nvmrc`中的版本）！
  - 您可以通过[nvm](https://github.com/nvm-sh/nvm)轻松做到这一点，而不会影响您的基础安装。只需运行 `nvm install`，然后运行 `nvm use`，它将自动安装并使用在`nvmrc`中指定的版本。
- 确保您的微语文件夹路径中没有任何空格。
- 如果您收到 `"TypeError: Failed to fetch dynamically imported module"`，确保所有导入都以 `.js` 结尾。
- 如果您遇到React错误，尝试运行 `NODE_OPTIONS="--max-old-space-size=8192" npm run buildreact`。
- 如果您看到缺少样式，等待几秒钟然后重新加载。
- 如果您在运行./scripts/code.sh时遇到类似 `npm error libtool: error: unrecognised option: '-static'` 的错误，确保您有GNU libtool而不是BSD libtool（BSD是macOS的默认值）
- 如果您在运行./scripts/code.sh时遇到类似 `The SUID sandbox helper binary was found, but is not configured correctly` 的错误，运行
`sudo chown root:root .build/electron/chrome-sandbox && sudo chmod 4755 .build/electron/chrome-sandbox`，然后再次运行 `./scripts/code.sh`。
- 如果您有任何其他问题，请随时[提交问题](https://github.com/Bytedesk/bytedesk-editor/issues/new)。您也可以参考VSCode的完整[如何贡献](https://github.com/microsoft/vscode/wiki/How-to-Contribute)页面。

## 打包

我们通常不推荐打包。相反，您应该只是构建。如果您确定要将微语打包成可执行应用程序，请确保您首先构建，然后运行以下命令之一。这将在void/代码库外部创建一个名为 `VSCode-darwin-arm64` 或类似的文件夹（见下文）。请耐心等待 - 打包可能需要约25分钟。

### Mac

- `npm run gulp vscode-darwin-arm64` - 最常见（Apple Silicon）
- `npm run gulp vscode-darwin-x64`（Intel）

### Windows

- `npm run gulp vscode-win32-x64` - 最常见
- `npm run gulp vscode-win32-arm64`

### Linux

- `npm run gulp vscode-linux-x64` - 最常见
- `npm run gulp vscode-linux-arm64`

### 输出

这将在 `void/` 外部生成一个文件夹：

```bash
workspace/
├── void/   # 您的微语分支
└── VSCode-darwin-arm64/ # 生成的输出
```

### 分发

微语的维护者在我们的网站和发布中分发微语。我们的构建管道是VSCodium的分支，它通过运行GitHub Actions来创建下载文件。带有更多说明的构建代码库位于[这里](https://github.com/Bytedesk/bytedesk-editor-builder)。

## Pull Request指南

- 一旦您做出了更改，请提交pull request。
- 除非您正在创建可能涉及多个PR的新功能，否则无需提交Issue。
- 请不要使用AI来编写您的PR 🙂

## 许可证

Business Source License 1.1: <https://github.com/Bytedesk/bytedesk/blob/main/LICENSE>

仅支持企业内部员工自用，严禁私自用于销售、二次销售或者部署SaaS方式销售。

## 联系方式

- 技术/商务联系：<270580156@qq.com>
- 官网：bytedesk.com

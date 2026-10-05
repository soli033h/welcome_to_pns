# Docker 개발 환경 작업 기록

이 문서는 GitHub에서 프로젝트를 가져온 뒤 Docker 기반 개발 환경을 구성하면서 수행한 작업을 정리한 기록입니다.

현재 프로젝트는 Astro 정적 사이트이며, Docker를 사용하면 호스트 컴퓨터에 Node.js와 npm을 별도로 설치하지 않고 개발 서버를 실행할 수 있습니다.

## 1. 기존 프로젝트 상태 확인

먼저 프로젝트 루트의 파일과 Git 상태를 확인했습니다.

```powershell
Get-ChildItem -Force | Select-Object Mode,Length,LastWriteTime,Name
git status --short --branch
git --no-pager log -1 --oneline
```

확인한 내용은 다음과 같습니다.

- Astro 프로젝트 파일인 `package.json`, `astro.config.mjs`, `src/`가 존재했습니다.
- 기존 `Dockerfile`이 이미 있었지만, Astro 개발 서버가 아니라 빌드 결과물을 Nginx로 제공하는 배포용 설정이었습니다.
- 현재 브랜치는 `main`이었고, 작업 시작 시점에는 변경 사항이 없었습니다.

## 2. 기존 Dockerfile 확인

기존 [Dockerfile](./Dockerfile)은 다음 순서로 동작하고 있었습니다.

1. `node:22-alpine` 이미지에서 npm 의존성 설치
2. Astro 프로젝트 빌드
3. 빌드 결과물인 `dist/`를 `nginx:alpine` 이미지에 복사
4. Nginx로 정적 파일 제공

즉, 기존 설정은 배포에는 적합하지만 소스 파일을 수정하면서 Astro 개발 서버의 핫 리로드를 사용하는 용도는 아니었습니다.

## 3. Docker 및 Node.js 설치 여부 확인

다음 명령으로 Docker와 Node.js 설치 여부를 확인했습니다.

```powershell
docker --version
docker compose version
npm --version
node --version
```

확인 결과:

- Docker와 Docker Compose는 설치되어 있었습니다.
- 호스트 컴퓨터에서는 `npm`과 `node` 명령을 찾을 수 없었습니다.

따라서 Node.js를 호스트에 설치하는 대신, Docker 컨테이너 내부에서 `npm ci`와 Astro 개발 서버를 실행하는 방식으로 구성했습니다.

## 4. Dockerfile에 개발용 단계 추가

기존 배포용 단계는 유지하면서 `development`라는 별도의 빌드 단계를 추가했습니다.

```dockerfile
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
```

이 단계의 역할은 다음과 같습니다.

- Node.js 22 Alpine 이미지를 사용합니다.
- 컨테이너 내부 작업 폴더를 `/app`으로 설정합니다.
- `package.json`과 `package-lock.json`을 먼저 복사합니다.
- `npm ci`로 잠금 파일 기준의 의존성을 설치합니다.
- 프로젝트 소스 파일을 컨테이너에 복사합니다.

기존의 `builder`와 `runner` 단계는 삭제하지 않았습니다. 따라서 현재 `Dockerfile`은 개발용과 배포용을 모두 지원합니다.

## 5. docker-compose.yml 추가

개발 서버를 쉽게 실행하기 위해 [docker-compose.yml](./docker-compose.yml)을 추가했습니다.

```yaml
services:
  dev:
    image: welcome-to-pns-dev
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    working_dir: /app
    command: npm run dev -- --host 0.0.0.0
    ports:
      - "4321:4321"
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true

volumes:
  node_modules:
```

주요 설정은 다음과 같습니다.

- `target: development`: Dockerfile의 개발용 단계만 사용합니다.
- `working_dir: /app`: 컨테이너 안에서 프로젝트 루트를 사용합니다.
- `npm run dev -- --host 0.0.0.0`: Astro 개발 서버를 외부에서 접근할 수 있도록 실행합니다.
- `"4321:4321"`: 호스트의 4321 포트를 컨테이너의 4321 포트에 연결합니다.
- `.:/app`: 호스트의 소스 코드를 컨테이너에 연결합니다.
- `node_modules:/app/node_modules`: 호스트의 `node_modules`가 없어도 컨테이너 내부 의존성을 유지합니다.
- `CHOKIDAR_USEPOLLING=true`: 파일 변경 감지를 안정적으로 처리하도록 설정합니다.

## 6. 개발 이미지 빌드

다음 명령으로 개발용 Docker 이미지를 빌드했습니다.

```powershell
docker compose build dev
```

빌드 결과:

- `welcome-to-pns-dev` 이미지가 생성되었습니다.
- 컨테이너 내부에서 `npm ci`가 정상 실행되었습니다.
- 의존성 설치와 이미지 생성이 완료되었습니다.

빌드 중 npm audit에서 의존성 관련 경고가 표시되었지만, 이미지 빌드 자체는 성공했습니다. 이 경고는 Docker 설정 오류가 아니라 현재 npm 의존성 트리의 보안 감사 결과입니다.

## 7. 개발 서버 실행

다음 명령으로 개발 서버를 실행했습니다.

```powershell
docker compose up dev
```

백그라운드로 실행하려면 다음과 같이 사용할 수 있습니다.

```powershell
docker compose up -d dev
```

Astro는 컨테이너 내부에서 다음 주소로 실행됩니다.

```text
http://localhost:4321/
```

## 8. 개발 서버 응답 확인

서버가 실제로 응답하는지 PowerShell에서 확인했습니다.

```powershell
$response = Invoke-WebRequest -Uri http://localhost:4321/ -UseBasicParsing
Write-Output ("HTTP {0}, bytes {1}" -f $response.StatusCode, $response.Content.Length)
```

확인 결과:

```text
HTTP 200
```

따라서 Docker 컨테이너 안에서 실행된 Astro 개발 서버가 정상적으로 페이지를 제공하는 것을 확인했습니다.

## 9. 개발 서버 종료

검증 후 다음 명령으로 컨테이너와 Compose 네트워크를 종료했습니다.

```powershell
docker compose down
```

컨테이너는 종료되지만 named volume인 `node_modules`는 기본적으로 유지됩니다. 의존성 볼륨까지 삭제하려면 다음 명령을 사용할 수 있습니다.

```powershell
docker compose down -v
```

단, `-v` 옵션은 Compose가 만든 `node_modules` 볼륨을 삭제하므로 다음 실행 때 의존성을 다시 설치해야 할 수 있습니다.

## 10. 현재 사용 방법

프로젝트 폴더에서 다음 명령만 실행하면 됩니다.

```powershell
cd C:\office\welcome_to_pns
docker compose up --build dev
```

그 다음 브라우저에서 다음 주소를 엽니다.

```text
http://localhost:4321/
```

로그를 별도로 확인하려면 다음 명령을 사용합니다.

```powershell
docker compose logs -f dev
```

종료하려면 실행 중인 터미널에서 `Ctrl + C`를 누르거나 다음 명령을 실행합니다.

```powershell
docker compose down
```

## 11. Dev Container 설정에 관하여

이후 추가했던 `.devcontainer/devcontainer.json`은 현재 삭제된 상태입니다. 따라서 이 문서에서는 Dev Container 설정을 프로젝트의 현재 구성으로 포함하지 않습니다.

현재 구성은 **Docker Compose를 직접 실행하는 방식**입니다.

- VS Code의 Dev Containers 확장 없이 사용할 수 있습니다.
- Docker Desktop만 실행되어 있으면 됩니다.
- VS Code에서는 호스트 폴더의 소스 파일을 수정하고, Astro 서버는 Docker에서 실행합니다.

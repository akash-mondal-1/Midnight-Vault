FROM debian:bookworm-slim

WORKDIR /app

# Install Node.js + dependencies
RUN apt-get update && apt-get install -y curl ca-certificates unzip nodejs npm && rm -rf /var/lib/apt/lists/*

# Install the Midnight toolchain v0.31.1 (official LFDT-Minokawa/compact release)
RUN curl -L -o /tmp/compactc.zip "https://github.com/LFDT-Minokawa/compact/releases/download/compactc-v0.31.1/compactc_v0.31.1_x86_64-unknown-linux-musl.zip" \
    && unzip -o /tmp/compactc.zip -d /usr/local/bin/ \
    && rm /tmp/compactc.zip \
    && chmod +x /usr/local/bin/compactc /usr/local/bin/compact

# Verify installation
RUN compactc --version 2>&1 || compact --version 2>&1

COPY contracts/Membership.compact /app/contracts/Membership.compact

# Default: compile the contract
CMD ["compact", "compile", "contracts/Membership.compact", "managed/Membership"]

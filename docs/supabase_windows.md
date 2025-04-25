# Troubleshooting Supabase Local Development Startup Issues on Windows

This document outlines common issues encountered when running `supabase start` for local development on Windows, focusing on port conflicts and Docker daemon connectivity problems, along with their solutions.

## Problem 1: Port Conflicts

### Symptoms

When running `supabase start`, you might encounter errors similar to this:

```
failed to start docker container: Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:54321 -> 127.0.0.1:0: listen tcp 0.0.0.0:54321: bind: An attempt was made to access a socket in a way forbidden by its access permissions.
```

This indicates that the port Supabase is trying to use (e.g., `54321`, `54324`, etc.) is already in use or reserved by another application or the operating system itself.

### Cause

*   **Another Application:** Another service or application might be running on that specific port.
*   **Windows Reserved Ports:** Windows, especially with features like Hyper-V or WSL enabled, often reserves ranges of ports dynamically, which can conflict with default application ports. The default Supabase ports in the `54xxx` range are sometimes affected.

### Solution Steps

1.  **Identify Conflicting Ports:** Note the specific port mentioned in the error message (e.g., `54321`, `54324`).
2.  **Modify `supabase/config.toml`:** The primary solution is to change the default ports in your `supabase/config.toml` file to a range less likely to be occupied. In this case, we changed the ports from the `5xxxx` range to the `6xxxx` range.
    *   Example change for the API port:
        ```toml
        [api]
        # Port to use for the API URL.
        port = 64321 # Changed from 54321
        ```
    *   **Important:** Ensure *all* relevant ports in `config.toml` are changed. In the reported case, the `[inbucket]` port was initially missed:
        ```toml
        [inbucket]
        # Port to use for the email testing server web interface.
        port = 64324 # Changed from 54324
        ```
3.  **Check for System Reserved Ports (Advanced):** If changing ports doesn't work, you can check if Windows has explicitly reserved the port range. Open PowerShell *as Administrator* and run:
    ```powershell
    netsh interface ipv4 show excludedportrange protocol=tcp
    ```
    Look for ranges that include the port you are trying to use. If you find a conflicting range, you might attempt to remove the reservation (use with caution, understand what the reservation is for):
    ```powershell
    # Example: Remove reservation starting at 54320 covering 50 ports
    # Adjust startport and numberofports based on your findings
    netsh int ipv4 delete excludedportrange protocol=tcp startport=54320 numberofports=50
    ```
    Restarting the machine might be necessary after modifying excluded ranges.

## Problem 2: Docker Container Name Conflict

### Symptoms

You might see an error like this:

```
failed to create docker container: Error response from daemon: Conflict. The container name "/supabase_vector_TEST" is already in use by container "...". You have to remove (or rename) that container to be able to reuse that name.
```

### Cause

This usually happens if a previous `supabase start` or `supabase stop` command didn't shut down and remove the containers cleanly.

### Solution Steps

1.  **Stop Supabase Services:** Ensure all related containers are stopped. Using `--no-backup` can sometimes help if the backup process itself is causing issues.
    ```bash
    supabase stop --no-backup
    ```
2.  **Manually Remove Conflicting Container:** Explicitly remove the container mentioned in the error message using Docker commands.
    ```bash
    docker rm supabase_vector_TEST
    ```
    (Replace `supabase_vector_TEST` with the actual container name from the error if different). If the container doesn't exist (perhaps `supabase stop` already removed it), this command will simply report that, which is fine.

## Problem 3: Docker Daemon Connection Error (Analytics Service)

### Symptoms

After resolving port and container name conflicts, `supabase start` might still fail, often with the `supabase_vector_TEST` container becoming unhealthy. Logs for this container (visible during `supabase start` or via `docker logs supabase_vector_TEST`) might show:

```
WARNING: analytics requires docker daemon exposed on tcp://localhost:2375
...
ERROR vector::sources::docker_logs: Listing currently running containers failed. error=error trying to connect: tcp connect error: Network unreachable (os error 101)
```

### Cause

*   The Supabase analytics service (`vector`) attempts to collect logs from other Docker containers by connecting to the Docker daemon.
*   By default, it tries to connect via a TCP socket (`tcp://localhost:2375`).
*   On Windows with Docker Desktop, the daemon typically listens on a *named pipe* for security reasons, not a TCP socket, unless explicitly configured otherwise. The `vector` container cannot reach the daemon via the expected TCP route.

### Solution Steps

1.  **Disable Analytics Service (Recommended for Local Dev):** Since the analytics service is often non-essential for local development workflows, the simplest solution is to disable it.
    *   Edit `supabase/config.toml`.
    *   Find the `[analytics]` section.
    *   Set `enabled = false`:
        ```toml
        [analytics]
        enabled = false # Changed from true
        port = 64327
        backend = "postgres"
        ```
    *   Run `supabase stop --no-backup` and then `supabase start` again. This was the solution applied successfully in this scenario.
2.  **Expose Docker Daemon via TCP (Alternative, Use with Caution):**
    *   Open Docker Desktop settings.
    *   Go to the "General" section.
    *   Enable the option "Expose daemon on tcp://localhost:2375 without TLS".
    *   **Security Warning:** Be aware that enabling this allows any process on your machine to potentially interact with your Docker daemon without encryption or authentication. Only enable this if you understand the risks.
    *   Apply the changes and restart Docker Desktop. Then try `supabase start` again.

## Testing Docker Port Binding Directly

If you suspect Docker itself is having trouble binding to a specific port on your host, independent of Supabase, you can try running a simple container mapped to that port.

For example, to test if Docker can use host port `54322`:

```bash
# Try in Windows PowerShell/CMD
docker run -d --rm -p 54322:5432 postgres:alpine

# If using WSL, you can also try it from within your WSL distribution (e.g., Ubuntu)
# Ensure Docker Desktop is configured for WSL integration
docker run -d --rm -p 54322:5432 postgres:alpine
```

If this `docker run` command fails with a port binding error, it confirms an issue at the Docker/OS level, likely related to the port being used or reserved. If it succeeds, the port is available to Docker, and the issue likely lies within the Supabase configuration or container setup. Remember to stop the test container afterwards (`docker stop <container_id>`).

## Conclusion

By systematically addressing port conflicts (changing them in `config.toml`), ensuring clean Docker state (`supabase stop`, `docker rm`), and disabling the analytics service (`[analytics] enabled = false`), the `supabase start` command was able to successfully launch the local development environment on Windows. 
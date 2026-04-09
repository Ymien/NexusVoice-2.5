cmake_minimum_required(VERSION 3.10)
project(TerminalClient)

set(CMAKE_CXX_STANDARD 17)

# 寻找 libcurl
find_package(CURL REQUIRED)

# nlohmann_json 可以通过包管理器安装，或者只需将其包含目录加入
# 假设系统中已安装 nlohmann_json
# find_package(nlohmann_json REQUIRED) # 可选

add_executable(terminal_client terminal_client.cpp)

# 链接 curl
target_link_libraries(terminal_client PRIVATE CURL::libcurl)

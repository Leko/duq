extern crate getopts;
use getopts::Options;
use std::env;
use std::path::Path;

fn query_disk_usage(path: &str, query: &str) {
    println!("{} with {}", path, query);
}

fn print_usage(program: &str, opts: Options) {
    let brief = format!("Usage: {} PATH QUERY [options]", program);
    print!("{}", opts.usage(&brief));
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let program_path = args[0].clone();
    let program = Path::new(&program_path)
        .file_name()
        .unwrap()
        .to_str()
        .unwrap();

    let mut opts = Options::new();
    opts.optopt("d", "depth", "Display an entry for all files and directories depth directories deep", "depth");
    opts.optflag("h", "", "\"Human-readable\" output. Use unit suffixes: Byte, Kilobyte, Megabyte, Gigabyte, Terabyte and Petabyte");
    opts.optflag("", "help", "Display this help menu");
    let matches = match opts.parse(&args[1..]) {
        Ok(m) => m,
        Err(f) => panic!(f.to_string()),
    };
    if matches.opt_present("h") {
        print_usage(&program, opts);
        return;
    }
    let path = if !matches.free.is_empty() {
        matches.free[0].clone()
    } else {
        print_usage(&program, opts);
        return;
    };
    let query = if !matches.free.is_empty() {
        matches.free[1].clone()
    } else {
        print_usage(&program, opts);
        return;
    };
    query_disk_usage(&path, &query);
}

extern crate getopts;
use getopts::Options;
use std::env;
use std::path::Path;

fn query_disk_usage(inp: &str, out: Option<String>) {
    println!("{}", inp);
    match out {
        Some(x) => println!("{}", x),
        None => println!("No Output"),
    }
}

fn print_usage(program: &str, opts: Options) {
    let brief = format!("Usage: {} PATH [options]", program);
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
    opts.optopt("o", "", "set output file name", "NAME");
    opts.optflag("h", "help", "print this help menu");
    let matches = match opts.parse(&args[1..]) {
        Ok(m) => m,
        Err(f) => panic!(f.to_string()),
    };
    if matches.opt_present("h") {
        print_usage(&program, opts);
        return;
    }
    let output = matches.opt_str("o");
    let input = if !matches.free.is_empty() {
        matches.free[0].clone()
    } else {
        print_usage(&program, opts);
        return;
    };
    query_disk_usage(&input, output);
}
